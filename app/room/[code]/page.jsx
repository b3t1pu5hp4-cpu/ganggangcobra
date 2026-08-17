"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Camera, Volume2, VolumeX, Download, Repeat, Users } from "lucide-react";
import { supabase, SHOTS_BUCKET } from "@/lib/supabaseClient";
import { FILTERS, SHOT_PROMPTS, STRIP_THEMES, MAX_PARTICIPANTS, TOTAL_SHOTS, COUNTDOWN_LEAD_MS } from "@/lib/constants";
import { compositeStrip } from "@/lib/compositeStrip";

function Stamp({ children, className = "" }) {
  return <span className={`font-mono text-[10px] tracking-[0.25em] uppercase text-brass/80 ${className}`}>{children}</span>;
}

function BrassButton({ children, onClick, variant = "solid", className = "", disabled }) {
  const base =
    "relative px-8 py-3.5 rounded-[2px] font-display text-[13px] tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "solid"
      ? "bg-brass text-ink hover:bg-brass-light shadow-[0_4px_18px_rgba(169,130,76,0.25)]"
      : "border border-brass/60 text-ivory hover:border-brass hover:bg-brass/10";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function getParticipantId(code) {
  if (typeof window === "undefined") return "server";
  const key = `gangcobra:${code}:pid`;
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function RoomPage() {
  const { code: rawCode } = useParams();
  const code = (rawCode || "").toUpperCase();
  const search = useSearchParams();
  const myName = search.get("name") || "Guest";
  const myMember = search.get("member") || "guest";

  const myId = useMemo(() => getParticipantId(code), [code]);

  const [participants, setParticipants] = useState({}); // id -> { name, ready, joinedAt }
  const [full, setFull] = useState(false);
  const [phase, setPhase] = useState("lobby"); // lobby | countdown | flash | preview | developing | final
  const [round, setRound] = useState(0);
  const [countLeft, setCountLeft] = useState(3);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [soundOn, setSoundOn] = useState(true);
  const [myShots, setMyShots] = useState([]); // my own captured data urls, for on-screen preview
  const [shotUrls, setShotUrls] = useState({}); // participantId -> [url x round]
  const [finalStripUrl, setFinalStripUrl] = useState(null);
  const [theme, setTheme] = useState(STRIP_THEMES[1]);
  const [error, setError] = useState(null);
  const [camReady, setCamReady] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const channelRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureTimerRef = useRef(null);
  const roundOrderRef = useRef([]); // stable seat order, locked when the first round starts

  const readyCount = Object.values(participants).filter((p) => p.ready).length;
  const total = Object.keys(participants).length;
  const amHost = useMemo(() => {
    const ids = Object.keys(participants).sort();
    return ids.length > 0 && ids[0] === myId;
  }, [participants, myId]);

  // camera
  useEffect(() => {
    let activeStream;
    async function startCam() {
      try {
        const constraints = {
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        };
        let s;
        try {
          s = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
          s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        activeStream = s;
        setMediaStream(s);
        setCamReady(true);
      } catch (err) {
        console.error(err);
        setError("Your camera is needed to enter the booth.");
      }
    }
    startCam();
    return () => {
      activeStream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream, phase]);

  const captureFrame = useCallback(async () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 560;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const hasVideo = video && (video.readyState >= 2 || video.videoWidth > 0);

    if (hasVideo) {
      ctx.save();
      if (filter?.css && filter.css !== "none") {
        ctx.filter = filter.css;
      }
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      if (typeof drawFilterOverlay === "function" && filter?.overlay) {
        drawFilterOverlay(ctx, filter.overlay, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = "#221c17";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#e0c9a6";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷 No Signal", canvas.width / 2, canvas.height / 2);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { dataUrl, blob };
  }, [filter]);

  // realtime channel: presence (who's in the room + ready state) + broadcast (round sync)
  useEffect(() => {
    if (!code) return;
    const channel = supabase.channel(`room:${code}`, {
      config: { presence: { key: myId }, broadcast: { self: true } },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const ids = Object.keys(state);
      if (!state[myId] && ids.length >= MAX_PARTICIPANTS) {
        setFull(true);
        return;
      }
      const next = {};
      ids.forEach((id) => {
        const p = state[id][0];
        next[id] = { name: p.name, ready: !!p.ready, joinedAt: p.joinedAt };
      });
      setParticipants(next);
    });

    channel.on("broadcast", { event: "start_round" }, ({ payload }) => {
      if (payload.round === 0) roundOrderRef.current = payload.seatOrder;
      setRound(payload.round);
      setPhase("countdown");
      const target = payload.captureAt;
      const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
          clearInterval(captureTimerRef.current);
          runCaptureAndUpload(payload.round);
        } else {
          setCountLeft(Math.max(1, Math.ceil(diff / 1000)));
        }
      };
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = setInterval(tick, 150);
      tick();
    });

    channel.on("broadcast", { event: "shot_ready" }, ({ payload }) => {
      setShotUrls((prev) => {
        const arr = prev[payload.participantId] ? [...prev[payload.participantId]] : [];
        arr[payload.round] = payload.url;
        return { ...prev, [payload.participantId]: arr };
      });
    });

    channel.on("broadcast", { event: "next_phase" }, ({ payload }) => {
      setPhase(payload.phase);
    });

    channel.on("broadcast", { event: "session_complete" }, ({ payload }) => {
      roundOrderRef.current = payload.seatOrder;
      setPhase("developing");
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ name: myName, ready: false, joinedAt: Date.now() });
      }
    });

    return () => {
      clearInterval(captureTimerRef.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, myId]);

  const runCaptureAndUpload = useCallback(
    async (r) => {
      setPhase("flash");
      const { dataUrl, blob } = await captureFrame();
      setMyShots((prev) => {
        const arr = [...prev];
        arr[r] = dataUrl;
        return arr;
      });
      const path = `${code}/${r}/${myId}.jpg`;
      let finalUrl = dataUrl;
    try {
      const uploadRes = await supabase.storage.from(SHOTS_BUCKET).upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (!uploadRes.error) {
        const { data } = supabase.storage.from(SHOTS_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) finalUrl = data.publicUrl;
      }
    } catch (e) {
      console.warn("Storage upload fallback to dataUrl", e);
    }
    channelRef.current?.send({
      type: "broadcast",
      event: "shot_ready",
      payload: { participantId: myId, round: r, url: finalUrl },
    });
      setTimeout(() => setPhase("preview"), 250);
    },
    [captureFrame, code, myId]
  );

  // Host drives round progression once everyone is ready, and once a round's
  // shots have all arrived. Every client still runs its own countdown off
  // the broadcast timestamp — the host just decides *when* to say "go".
  useEffect(() => {
    if (!amHost || !channelRef.current) return;
    const ids = Object.keys(participants).sort();
    if (ids.length === 0) return;

    if (phase === "lobby" && readyCount === total && total > 0) {
      roundOrderRef.current = ids;
      channelRef.current.send({
        type: "broadcast",
        event: "start_round",
        payload: { round: 0, captureAt: Date.now() + COUNTDOWN_LEAD_MS, seatOrder: ids },
      });
    }

    if (phase === "preview") {
      const gotAll = ids.every((id) => shotUrls[id]?.[round]);
      if (gotAll) {
        const t = setTimeout(() => {
          if (round + 1 >= TOTAL_SHOTS) {
            channelRef.current.send({ type: "broadcast", event: "session_complete", payload: { seatOrder: ids } });
          } else {
            channelRef.current.send({
              type: "broadcast",
              event: "start_round",
              payload: { round: round + 1, captureAt: Date.now() + COUNTDOWN_LEAD_MS, seatOrder: ids },
            });
          }
        }, 1500);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amHost, participants, phase, readyCount, total, shotUrls, round]);

  useEffect(() => {
    if (phase === "developing") {
      const mergedShotUrls = { ...shotUrls, [myId]: myShots };
      const rawIds = roundOrderRef.current?.length
        ? roundOrderRef.current
        : Object.keys(participants).length
        ? Object.keys(participants)
        : [myId];
      const pIds = Array.from(new Set(rawIds.filter(Boolean)));
      if (!pIds.includes(myId)) pIds.unshift(myId);

      compositeStrip(pIds, mergedShotUrls, { theme: theme.id })
        .then((url) => {
          setFinalStripUrl(url);
          setPhase("final");
        })
        .catch((err) => {
          console.error("Composite strip failed:", err);
          setPhase("final");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const toggleReady = () => {
    channelRef.current?.track({ name: myName, ready: true, joinedAt: participants[myId]?.joinedAt || Date.now() });
  };

  if (full) {
    return <Centered><p className="font-display italic text-xl">The Gang Cobra booth is full.</p></Centered>;
  }
  if (error) {
    return <Centered><p className="font-display italic text-xl">{error}</p></Centered>;
  }

  return (
    <div className="min-h-screen bg-ink-deep text-ivory">
      <canvas ref={canvasRef} className="hidden" />

      {phase === "lobby" && (
        <Centered>
          <Stamp>Gang Cobra Photobooth</Stamp>
          <h2 className="font-display text-3xl mt-2 mb-1">Room code: {code}</h2>
          <p className="font-mono text-xs text-brass/70 tracking-widest mb-8">{total} / {MAX_PARTICIPANTS} connected</p>
          <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
            {Object.entries(participants).map(([id, p]) => (
              <div key={id} className={`flex items-center gap-3 p-3 rounded-[2px] border ${id === myId ? "border-brass" : "border-brass/20"} bg-[#221a15]/60`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3a2e26] to-[#171310] flex items-center justify-center border border-brass/30 shrink-0">
                  <span className="font-display text-sm text-brass">{p.name[0]}</span>
                </div>
                <div className="text-left min-w-0">
                  <p className="font-display text-sm truncate">{p.name}{id === myId ? " (you)" : ""}</p>
                  <p className={`font-mono text-[9px] uppercase tracking-widest ${p.ready ? "text-[#8a9b6e]" : "text-brass/60"}`}>{p.ready ? "ready" : "waiting"}</p>
                </div>
              </div>
            ))}
          </div>
          <BrassButton onClick={toggleReady} disabled={participants[myId]?.ready} className="w-full max-w-md">
            {participants[myId]?.ready ? "Waiting on everyone…" : "I'm Ready"}
          </BrassButton>
          <p className="mt-5 flex items-center justify-center gap-2 text-brass/50 font-mono text-[9px] uppercase tracking-widest">
            <Users size={12} /> Share this room's link to invite the rest of the crew
          </p>
        </Centered>
      )}

      {["countdown", "flash", "preview"].includes(phase) && (
        <div className="flex flex-col items-center px-5 py-8">
          <div className="w-full max-w-sm flex items-center justify-between mb-4">
            <Stamp>{SHOT_PROMPTS[round].label} / {TOTAL_SHOTS} · {SHOT_PROMPTS[round].pose}</Stamp>
            <button onClick={() => setSoundOn((s) => !s)} className="text-brass/70">{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
          </div>

          <div className="relative w-full max-w-sm aspect-[4/5] bg-[#171310] rounded-[3px] overflow-hidden border border-brass/25 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className={"w-full h-full object-cover scale-x-[-1] " + (camReady ? "block" : "hidden")}
  style={{ filter: filter.css }}
/>
{!camReady && (
  <div className="w-full h-full flex items-center justify-center text-brass/40 flex-col gap-2">
    <Camera size={28} />
    <span className="font-mono text-[10px] tracking-widest uppercase">Loading camera...</span>
  </div>
)}
            {phase === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="font-display text-8xl">{countLeft}</span>
              </div>
            )}
            {phase === "flash" && <div className="absolute inset-0 bg-white animate-flash" />}
            {phase === "preview" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                {myShots[round] && <img src={myShots[round]} alt="captured" className="w-40 rounded-sm shadow-lg" />}
                <p className="font-mono text-[10px] tracking-widest uppercase text-brass">
                  {Object.keys(shotUrls).filter((id) => shotUrls[id]?.[round]).length} / {total} composed
                </p>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm mt-5">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(FILTERS || []).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest border transition-all ${
                    filter.id === f.id ? "border-brass text-brass bg-brass/10" : "border-brass/20 text-brass/50"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "developing" && (
        <Centered>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-brass animate-pulse">Developing your memories…</p>
        </Centered>
      )}

      {phase === "final" && finalStripUrl && (
        <Centered>
          <Stamp className="mb-1">The memory has been developed.</Stamp>
          <h2 className="font-display text-2xl mb-6">Gang Cobra Strip</h2>
          <img src={finalStripUrl} alt="Gang Cobra strip" className="w-56 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rotate-[-1deg]" />
          <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar max-w-sm">
            {STRIP_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={async () => {
                  setTheme(t);
                  const mergedShotUrls = { ...shotUrls, [myId]: myShots };
              const rawIds = roundOrderRef.current?.length ? roundOrderRef.current : Object.keys(participants);
              const pIds = Array.from(new Set([myId, ...rawIds].filter(Boolean)));
              const url = await compositeStrip(pIds, mergedShotUrls, { theme: t.id });
                  setFinalStripUrl(url);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-widest border ${
                  theme.id === t.id ? "border-brass text-brass bg-brass/10" : "border-brass/20 text-brass/50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
            <a href={finalStripUrl} download={`gang-cobra-${code}.png`}>
              <BrassButton className="w-full flex items-center justify-center gap-2">
                <Download size={14} /> Download 6×3 Strip
              </BrassButton>
            </a>
            <BrassButton
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setPhase("lobby");
                setRound(0);
                setMyShots([]);
                setShotUrls({});
                setFinalStripUrl(null);
                channelRef.current?.track({ name: myName, ready: false, joinedAt: Date.now() });
              }}
            >
              <Repeat size={14} /> Take Another Strip
            </BrassButton>
          </div>
        </Centered>
      )}
    </div>
  );
}

function Centered({ children }) {
  return <div className="min-h-screen flex flex-col items-center justify-center px-6 py-14 text-center">{children}</div>;
}
