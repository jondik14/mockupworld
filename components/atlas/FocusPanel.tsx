"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasItem, SAMPLE_SCREENS, assetPath, sampleScreenPath } from "@/lib/atlas";
import { Compositor, loadImage } from "./compositor";
import s from "./atlas.module.css";

export type ScreenChoice = { kind: "baked" } | { kind: "user" } | { kind: "sample"; name: string };

interface Props {
  item: AtlasItem | null;
  similars: AtlasItem[];
  choice: ScreenChoice;
  userScreen: { img: HTMLImageElement; url: string } | null;
  status: string;
  onStatus: (msg: string) => void;
  onChoose: (c: ScreenChoice) => void;
  onFile: (f: File | null | undefined) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
  onSearch: (q: string) => void;
}

async function toPng(src: string): Promise<Blob> {
  const img = await loadImage(src);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed."))), "image/png"));
}

export function FocusPanel(p: Props) {
  const { item, choice, userScreen } = p;
  const compositor = useRef<Compositor | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ id: string; url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dropping, setDropping] = useState(false);

  const placed = choice.kind !== "baked" && result?.id === item?.id ? result : null;

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [item?.id]);

  useEffect(() => {
    if (!item || choice.kind === "baked") return;
    if (choice.kind === "user" && !userScreen) return;
    let cancelled = false;
    compositor.current ??= new Compositor();
    const comp = compositor.current;
    (async () => {
      setBusy(true);
      try {
        const screen =
          choice.kind === "user" ? userScreen!.img : await loadImage(sampleScreenPath(item.tags.device, choice.name));
        const blob = await comp.render(item, screen);
        if (cancelled) return;
        setResult((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { id: item.id, url: URL.createObjectURL(blob), blob };
        });
      } catch (err) {
        if (!cancelled) p.onStatus(err instanceof Error ? err.message : "Couldn't place that screen.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // p.onStatus is a stable setState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, choice, userScreen]);

  const copy = () => {
    if (!item) return;
    const png = placed ? Promise.resolve(placed.blob) : toPng(assetPath.full(item.id));
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": png })])
      .then(() => p.onStatus("Copied. Paste it into Figma or Photoshop with ⌘V."))
      .catch(() => p.onStatus("Your browser blocked copying. Use Download instead."));
  };

  const screens: { choice: ScreenChoice; src: string; label: string }[] = item
    ? [
        ...(userScreen ? [{ choice: { kind: "user" } as ScreenChoice, src: userScreen.url, label: "Your screen" }] : []),
        ...SAMPLE_SCREENS[item.tags.device].map((s) => ({
          choice: { kind: "sample", name: s.name } as ScreenChoice,
          src: sampleScreenPath(item.tags.device, s.name),
          label: s.label,
        })),
      ]
    : [];
  const isChosen = (c: ScreenChoice) =>
    c.kind === choice.kind && (c.kind !== "sample" || (choice.kind === "sample" && choice.name === c.name));

  return (
    <aside
      ref={panelRef}
      className={`${s.panel} ${item ? "" : s.panelClosed}`}
      aria-label="Mockup detail"
      aria-hidden={!item}
    >
      {item ? (
        <>
          <div className={s.phead}>
            <div>
              <h1>{item.title}</h1>
              <div className={s.tags}>
                {Object.values(item.tags).map((t) => (
                  <button key={t} type="button" className={s.tag} title={`Search “${t}”`} onClick={() => p.onSearch(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button className={s.close} type="button" onClick={p.onClose}>
              Close <kbd>Esc</kbd>
            </button>
          </div>

          <div
            className={`${s.preview} ${dropping ? s.dropping : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropping(true);
            }}
            onDragLeave={() => setDropping(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDropping(false);
              p.onFile(e.dataTransfer.files[0]);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs from the compositor */}
            <img src={placed?.url ?? assetPath.full(item.id)} alt={item.title} width={item.w} height={item.h} />
            {busy ? <span className={s.busy}>placing…</span> : null}
          </div>

          <section className={s.sect}>
            <h3>Your screen</h3>
            <div className={s.uis}>
              <button type="button" className={`${s.ui} ${s.uiAdd}`} title="Upload your screen" onClick={() => fileRef.current?.click()}>
                +
              </button>
              {screens.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  className={s.ui}
                  title={o.label}
                  aria-pressed={isChosen(o.choice)}
                  onClick={() => p.onChoose(o.choice)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbs, may be blob URLs */}
                  <img alt={o.label} src={o.src} />
                </button>
              ))}
            </div>
            <p className={s.hint}>
              Drop a screenshot on the preview, upload one, or paste with <kbd>⌘V</kbd>. From Figma: select a frame,{" "}
              <kbd>⇧⌘C</kbd> (Copy as PNG), then <kbd>⌘V</kbd> here. It&apos;s placed with exact perspective, so your
              pixels stay untouched.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                p.onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </section>

          <section className={s.sect}>
            <div className={s.actions}>
              <button className={s.btn} type="button" onClick={copy}>
                Copy image
              </button>
              <a
                className={`${s.btn} ${s.ghost}`}
                href={placed?.url ?? assetPath.full(item.id)}
                download={placed ? `${item.id}.png` : `${item.id}.webp`}
              >
                Download
              </a>
              <span className={s.status} role="status">
                {p.status || "Copy, then paste into Figma, Photoshop or Slack."}
              </span>
            </div>
          </section>

          <section className={`${s.sect} ${s.later}`}>
            <h3>Planned</h3>
            <div>
              Figma plugin: send straight to your canvas <em>later</em>
            </div>
            <div>
              Photoshop .psd with smart-object screen <em>later</em>
            </div>
          </section>

          <section className={s.sect}>
            <h3>Similar ({p.similars.length}), dimmed on the canvas</h3>
            <div className={s.sims}>
              {p.similars.map((x) => (
                <button key={x.id} type="button" className={s.sim} title={x.title} onClick={() => p.onOpen(x.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- already-optimised webp thumbs */}
                  <img alt={x.title} src={assetPath.thumb(x.id)} />
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </aside>
  );
}
