"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { AtlasItem, QUICK_FILTERS, SAMPLE_SCREENS, search, similars } from "@/lib/atlas";
import { InfiniteCanvas } from "./canvas";
import { FocusPanel, ScreenChoice } from "./FocusPanel";
import s from "./atlas.module.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--atlas-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--atlas-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--atlas-mono" });

export function Atlas({ items }: { items: AtlasItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<InfiniteCanvas | null>(null);
  const [query, setQuery] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(true);
  const [rawChoice, setChoice] = useState<ScreenChoice>({ kind: "baked" });
  const [userScreen, setUserScreen] = useState<{ img: HTMLImageElement; url: string } | null>(null);
  const [status, setStatus] = useState("");

  const pool = useMemo(() => search(items, query), [items, query]);
  const byId = useMemo(() => new Map(items.map((d) => [d.id, d])), [items]);
  const focused = focusedId ? byId.get(focusedId) ?? null : null;
  const sims = useMemo(() => (focused ? similars(focused, items) : []), [focused, items]);

  const open = useCallback((id: string) => {
    setFocusedId(id);
    setNoteOpen(false);
    setStatus("");
    history.replaceState(null, "", `#${id}`);
  }, []);

  const close = useCallback(() => {
    setFocusedId(null);
    history.replaceState(null, "", location.pathname + location.search);
  }, []);

  useEffect(() => {
    const canvas = new InfiniteCanvas(
      stageRef.current!,
      { tile: s.tile, cap: s.cap, dim: s.dim, current: s.current, dragging: s.dragging },
      open,
    );
    canvasRef.current = canvas;
    canvas.setItems(search(items, ""));
    canvas.centerOn();
    const fromHash = decodeURIComponent(location.hash.slice(1));
    if (items.some((d) => d.id === fromHash)) queueMicrotask(() => open(fromHash));
    return () => canvas.destroy();
  }, [items, open]);

  useEffect(() => {
    canvasRef.current?.setItems(pool);
  }, [pool]);

  useEffect(() => {
    canvasRef.current?.setHighlight(focused ? new Set([focused.id, ...sims.map((x) => x.id)]) : null, focused?.id ?? null);
  }, [focused, sims]);

  // A "sample" screen only makes sense for the device it was made for (a
  // watch face doesn't fit a MacBook) — fall back to baked, without
  // touching the stored choice, when it doesn't apply to the newly focused
  // mockup. An uploaded screen always carries over.
  const choice = useMemo<ScreenChoice>(() => {
    if (!focused || rawChoice.kind !== "sample") return rawChoice;
    const valid = SAMPLE_SCREENS[focused.tags.device].some((s) => s.name === rawChoice.name);
    return valid ? rawChoice : { kind: "baked" };
  }, [focused, rawChoice]);

  const takeScreen = useCallback(
    async (file: File | null | undefined) => {
      if (!file || !file.type.startsWith("image/")) {
        setStatus("That file isn't an image. Use a PNG, JPG or WebP screenshot.");
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      setUserScreen((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { img, url };
      });
      setChoice({ kind: "user" });
      setStatus("Placed your screen.");
      if (!focusedId && pool[0]) open(pool[0].id);
    },
    [focusedId, pool, open],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input, textarea")) return;
      const step = 120;
      const moves: Record<string, [number, number]> = {
        ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step],
      };
      if (e.key === "Escape") close();
      else if (moves[e.key]) canvasRef.current?.pan(...moves[e.key]);
    };
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      e.preventDefault();
      takeScreen(item.getAsFile());
    };
    addEventListener("keydown", onKey);
    addEventListener("paste", onPaste);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("paste", onPaste);
    };
  }, [close, takeScreen]);

  const toggleChip = (label: string) => setQuery((q) => (q.trim().toLowerCase() === label.toLowerCase() ? "" : label));

  return (
    <div className={`${s.root} ${sans.variable} ${serif.variable} ${mono.variable}`}>
      <div ref={stageRef} className={s.stage} aria-label="Mockup canvas: drag to explore" />

      {pool.length === 0 ? (
        <div className={s.empty}>
          <div>
            <p>Nothing matches “{query}” yet</p>
            <button className={`${s.btn} ${s.ghost}`} type="button" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        </div>
      ) : null}

      <header className={s.bar}>
        <div className={s.mark}>
          <b>Atlas</b>
          <span>iPhone, MacBook &amp; Watch mockups</span>
        </div>
        <div className={s.search}>
          <label className={s.field} htmlFor="atlas-q">
            <input
              id="atlas-q"
              type="search"
              placeholder="Search — try flat lay, paywall, sage, dark"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={s.count}>{pool.length}</span>
          </label>
          <div className={s.chips}>
            {QUICK_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className={s.chip}
                aria-pressed={query.trim().toLowerCase() === label.toLowerCase()}
                onClick={() => toggleChip(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className={s.spacer} />
      </header>

      {noteOpen ? (
        <aside className={s.note}>
          <button className={s.noteClose} type="button" aria-label="Hide note" onClick={() => setNoteOpen(false)}>
            ×
          </button>
          <h2>Drag anywhere to explore.</h2>
          <p>
            Click a mockup to see its closest matches and drop your own screen onto it. 35 clay-style renders across
            iPhone, MacBook and Apple Watch, made in 3D.
          </p>
        </aside>
      ) : null}

      <FocusPanel
        item={focused}
        similars={sims}
        choice={choice}
        userScreen={userScreen}
        status={status}
        onStatus={setStatus}
        onChoose={setChoice}
        onFile={takeScreen}
        onOpen={open}
        onClose={close}
        onSearch={setQuery}
      />
    </div>
  );
}
