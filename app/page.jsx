"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { MEMBERS } from "@/lib/constants";
import { generateRoomCode, normalizeRoomCode } from "@/lib/roomCode";

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

function Entrance({ onDone }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 900);
    const t2 = setTimeout(() => setStage(2), 2600);
    return () => [t1, t2].forEach(clearTimeout);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink-deep text-ivory cursor-pointer" onClick={() => stage >= 2 && onDone()}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(60,45,35,0.4), transparent 60%)" }} />
      <div className={`relative text-center transition-all duration-[1400ms] ${stage >= 1 ? "opacity-100" : "opacity-0"}`}>
        <Stamp className="block mb-4">Welcome to</Stamp>
        <h1 className="font-display text-6xl md:text-8xl tracking-[0.08em]">Gang Cobra</h1>
        <p className={`mt-6 font-display italic text-[#c9b795] text-base transition-all duration-1000 ${stage >= 2 ? "opacity-100" : "opacity-0"}`}>
          "A little place for memories worth keeping."
        </p>
        <p className={`mt-10 text-xs tracking-[0.3em] uppercase text-brass/70 transition-opacity duration-700 ${stage >= 2 ? "opacity-100 animate-pulse" : "opacity-0"}`}>
          Tap to enter
        </p>
      </div>
    </div>
  );
}

function Lobby({ onJoin }) {
  return (
    <div className="relative min-h-screen bg-ink text-ivory overflow-hidden flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(80,60,45,0.35), transparent 55%)" }} />
      <div className="relative z-10">
        <Stamp className="mb-5 block">Six friends · one booth · different places</Stamp>
        <h1 className="font-display text-5xl md:text-7xl mb-3">Gang Cobra</h1>
        <p className="max-w-sm text-[#c9b795]/80 font-display italic mb-10">
          Step into the private studio. Wherever everyone is, the booth brings us into one frame.
        </p>
        <BrassButton onClick={onJoin} className="text-base px-10 py-4">Join the Photobooth</BrassButton>
        <p className="mt-4 font-mono text-[10px] tracking-[0.2em] text-brass/70 uppercase">Gang Cobra · Up to 10 people</p>
      </div>
    </div>
  );
}

function Identity({ onPick }) {
  const [picked, setPicked] = useState(null);
  const [guestName, setGuestName] = useState("");
  return (
    <div className="min-h-screen bg-ink text-ivory px-6 py-16">
      <div className="max-w-md mx-auto text-center">
        <Stamp>Identity</Stamp>
        <h2 className="font-display text-4xl mt-3 mb-8">Who are you?</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {MEMBERS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPicked({ id: m.id, name: m.name })}
              className={`group flex flex-col items-center gap-2 p-3 rounded-[2px] border transition-all ${
                picked?.id === m.id ? "border-brass bg-brass/10" : "border-brass/20 hover:border-brass/50"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3a2e26] to-[#171310] flex items-center justify-center border border-brass/30">
                <span className="font-display text-xl text-brass">{m.name[0]}</span>
              </div>
              <span className="font-display text-xs tracking-wide">{m.name}</span>
            </button>
          ))}
        </div>

        <div className={`mb-4 p-3 rounded-[2px] border ${picked?.id === "guest" ? "border-brass bg-brass/10" : "border-brass/20"}`}>
          <button
            onClick={() => setPicked({ id: "guest", name: guestName || "Guest" })}
            className="w-full font-mono text-[11px] tracking-[0.2em] uppercase mb-2"
          >
            I&apos;m a guest
          </button>
          {picked?.id === "guest" && (
            <input
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                setPicked({ id: "guest", name: e.target.value || "Guest" });
              }}
              placeholder="Your name"
              className="w-full bg-transparent border-b border-brass/40 text-center text-ivory placeholder-brass/40 py-1 outline-none"
            />
          )}
        </div>

        {picked && (
          <div className="mb-6 animate-fade-in">
            <p className="font-display italic text-lg text-[#c9b795]">Welcome, {picked.name}.</p>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-brass/60 mt-1">Your seat at the booth is waiting.</p>
          </div>
        )}

        <BrassButton onClick={() => onPick(picked)} disabled={!picked || (picked.id === "guest" && !guestName)} className="w-full">
          Enter the Booth
        </BrassButton>
      </div>
    </div>
  );
}

function RoomEntry({ me, onGo }) {
  const [mode, setMode] = useState("create");
  const [code, setCode] = useState("");
  return (
    <div className="min-h-screen bg-ink text-ivory px-6 py-16 flex flex-col items-center justify-center text-center">
      <Stamp>Welcome, {me.name}</Stamp>
      <h2 className="font-display text-4xl mt-3 mb-8">Create or Join</h2>

      <div className="flex gap-2 mb-6 font-mono text-[10px] uppercase tracking-widest">
        <button onClick={() => setMode("create")} className={`px-4 py-2 border rounded-[2px] ${mode === "create" ? "border-brass text-brass" : "border-brass/20 text-brass/50"}`}>
          Create Room
        </button>
        <button onClick={() => setMode("join")} className={`px-4 py-2 border rounded-[2px] ${mode === "join" ? "border-brass text-brass" : "border-brass/20 text-brass/50"}`}>
          Join Room
        </button>
      </div>

      {mode === "join" && (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ROOM CODE"
          className="mb-6 w-56 bg-transparent border-b border-brass/40 text-center tracking-[0.3em] uppercase text-ivory placeholder-brass/40 py-2 outline-none font-mono"
        />
      )}

      <BrassButton
        onClick={() => onGo(mode === "create" ? generateRoomCode() : normalizeRoomCode(code))}
        disabled={mode === "join" && !code.trim()}
        className="flex items-center gap-2"
      >
        <Users size={14} /> {mode === "create" ? "Create & Enter" : "Enter Room"}
      </BrassButton>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState("entrance");
  const [me, setMe] = useState(null);
  const router = useRouter();

  return (
    <>
      {screen === "entrance" && <Entrance onDone={() => setScreen("lobby")} />}
      {screen === "lobby" && <Lobby onJoin={() => setScreen("identity")} />}
      {screen === "identity" && (
        <Identity
          onPick={(m) => {
            setMe(m);
            setScreen("room-entry");
          }}
        />
      )}
      {screen === "room-entry" && me && (
        <RoomEntry
          me={me}
          onGo={(code) => {
            const params = new URLSearchParams({ name: me.name, member: me.id });
            router.push(`/room/${code}?${params.toString()}`);
          }}
        />
      )}
    </>
  );
}
