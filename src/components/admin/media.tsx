"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";
import { Film, ImageIcon, Images, Link2, Loader2, Search, UploadCloud, X } from "lucide-react";
import { listMedia, type MediaItem } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { Button, Field, formatBytes, inputClass, TextField } from "./ui";

/* ───────────── Upload ───────────── */

export type Uploaded = { url: string; width?: number; height?: number; contentType: string; size: number };

const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const VIDEO_TYPES = "video/mp4,video/webm,video/quicktime";

function slugifyName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "bin";
  return `${base || "file"}.${ext}`;
}

function imageSize(file: File): Promise<{ width: number; height: number } | undefined> {
  if (!file.type.startsWith("image/")) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function useUploader() {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (file: File): Promise<Uploaded | null> => {
    setError(null);
    const isImage = file.type.startsWith("image/");
    const limit = isImage ? 25 * 1024 * 1024 : 500 * 1024 * 1024;
    if (file.size > limit) {
      setError(`That file is ${formatBytes(file.size)}. The limit is ${formatBytes(limit)} for ${isImage ? "images" : "videos"}.`);
      return null;
    }
    setProgress(0);
    try {
      const dims = await imageSize(file);
      const blob = await upload(`media/${slugifyName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: file.type || undefined,
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      return { url: blob.url, contentType: blob.contentType, size: file.size, ...dims };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Check your connection and try again.");
      return null;
    } finally {
      setProgress(null);
    }
  }, []);

  return { send, progress, error, setError };
}

function DropZone({
  accept,
  onFile,
  progress,
  children,
  className,
}: {
  accept: string;
  onFile: (f: File) => void;
  progress: number | null;
  children: ReactNode;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn("relative", over && "ring-4 ring-accent/30", className)}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <UploadTrigger onClick={() => input.current?.click()} progress={progress} />
    </div>
  );
}

function UploadTrigger({ onClick, progress }: { onClick: () => void; progress: number | null }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" data-upload-trigger>
      <Button size="sm" variant="primary" onClick={onClick} disabled={progress !== null}>
        {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
        {progress !== null ? `Uploading ${progress}%` : "Upload new"}
      </Button>
    </div>
  );
}

/* ───────────── Library dialog ───────────── */

export function MediaLibrary({
  open,
  onClose,
  onPick,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  kind: "image" | "video" | "all";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setItems(null);
      listMedia().then((r) => (r.ok ? setItems(r.items) : setError(r.error)));
    } else if (!open && d.open) d.close();
  }, [open]);

  const shown = (items ?? []).filter((i) => (kind === "all" || i.kind === kind) && i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(64rem,calc(100vw-2rem))] max-h-[min(44rem,calc(100vh-2rem))] overflow-hidden rounded-2xl bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
          <Images className="size-5 text-ink/50" aria-hidden />
          <h2 className="font-display text-lg font-semibold">Media library</h2>
          <div className="relative ml-auto w-56 max-w-[45vw]">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" className={cn(inputClass, "h-9 py-1.5 pl-9 text-sm")} />
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink/50 hover:bg-ink/6 hover:text-ink">
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {!items && !error ? (
            <div className="flex items-center gap-2 text-sm text-mute-2">
              <Loader2 className="size-4 animate-spin" /> Loading your files…
            </div>
          ) : null}
          {items && shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-mute-2">
              {items.length === 0 ? "Nothing uploaded yet. Use “Upload new” instead." : "No files match."}
            </p>
          ) : null}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shown.map((item) => (
              <li key={item.url}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(item);
                    onClose();
                  }}
                  className="group block w-full overflow-hidden rounded-xl bg-paper text-left ring-1 ring-ink/10 transition hover:ring-2 hover:ring-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <div className="relative aspect-[4/3] bg-ink/5">
                    {item.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" loading="lazy" className="size-full object-cover" />
                    ) : item.kind === "video" ? (
                      <video src={`${item.url}#t=0.5`} muted preload="metadata" className="size-full object-cover" />
                    ) : null}
                    {item.kind === "video" ? (
                      <span className="absolute left-2 top-2 rounded-full bg-ink/75 px-2 py-0.5 text-[0.7rem] font-medium text-white">Video</span>
                    ) : null}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-[0.7rem] text-ink/45">{formatBytes(item.size)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}

/* ───────────── Image field ───────────── */

export type ImageValue = { src: string; alt: string; width?: number; height?: number };

export function ImageField<T extends ImageValue>({
  label,
  value,
  onChange,
  hint,
  aspect = "aspect-[16/10]",
  altHint = "Describe what's in the picture for people using screen readers and for Google.",
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  hint?: ReactNode;
  aspect?: string;
  altHint?: string;
}) {
  const { send, progress, error } = useUploader();
  const [libraryOpen, setLibraryOpen] = useState(false);

  const setFile = async (f: File) => {
    const up = await send(f);
    if (up) onChange({ ...value, src: up.url, ...(up.width ? { width: up.width, height: up.height } : {}) });
  };

  return (
    <Field label={label} hint={hint}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,20rem)_1fr]">
        <DropZone accept={IMAGE_TYPES} onFile={setFile} progress={progress} className="rounded-xl">
          <div className={cn("relative overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f1eee8_0_25%,#fff_0_50%)] bg-[length:16px_16px] ring-1 ring-ink/10", aspect)}>
            {value.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.src} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/40">
                <ImageIcon className="size-8" aria-hidden />
                <span className="text-xs">Drop an image here</span>
              </div>
            )}
            {progress !== null ? (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-ink/10">
                <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            ) : null}
          </div>
        </DropZone>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setLibraryOpen(true)}>
              <Images className="size-4" /> Choose from library
            </Button>
          </div>
          <TextArea value={value.alt} onChange={(alt) => onChange({ ...value, alt })} label="Image description (alt text)" hint={altHint} />
          {value.width && value.height ? (
            <p className="text-xs text-ink/45">
              {value.width} × {value.height}px
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
      <MediaLibrary
        open={libraryOpen}
        kind="image"
        onClose={() => setLibraryOpen(false)}
        onPick={(item) => onChange({ ...value, src: item.url })}
      />
    </Field>
  );
}

/* Local textarea to avoid a circular import with ui.tsx's auto-grow version. */
function TextArea({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <textarea value={value} rows={2} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "resize-y text-sm leading-relaxed")} />
    </Field>
  );
}

/* ───────────── Video field ───────────── */

/**
 * A video can be an uploaded file or (when allowLinks) a YouTube / Vimeo link.
 * value null = no video.
 */
export function VideoField({
  label,
  value,
  onChange,
  hint,
  allowLinks = false,
  warnAboveBytes = 15 * 1024 * 1024,
}: {
  label: string;
  value: string;
  onChange: (src: string, contentType?: string) => void;
  hint?: ReactNode;
  allowLinks?: boolean;
  warnAboveBytes?: number;
}) {
  const { send, progress, error } = useUploader();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const isLink = /youtube|youtu\.be|vimeo/i.test(value);

  const setFile = async (f: File) => {
    setWarning(
      f.size > warnAboveBytes
        ? `This video is ${formatBytes(f.size)}. Large videos load slowly on phones and use up the site's monthly bandwidth faster. Aim for under ${formatBytes(warnAboveBytes)} (around 15–30 seconds, 1080p).`
        : null,
    );
    const up = await send(f);
    if (up) onChange(up.url, up.contentType === "video/webm" ? "video/webm" : "video/mp4");
  };

  return (
    <Field label={label} hint={hint}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,20rem)_1fr]">
        <DropZone accept={VIDEO_TYPES} onFile={setFile} progress={progress}>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-ink ring-1 ring-ink/10">
            {value && !isLink ? (
              <video src={value} muted loop playsInline controls className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/45">
                {isLink ? <Link2 className="size-8" aria-hidden /> : <Film className="size-8" aria-hidden />}
                <span className="px-4 text-center text-xs">{isLink ? "Linked video (YouTube / Vimeo)" : "Drop a video here (MP4 or WebM)"}</span>
              </div>
            )}
            {progress !== null ? (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
                <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            ) : null}
          </div>
        </DropZone>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setLibraryOpen(true)}>
              <Images className="size-4" /> Choose from library
            </Button>
            {value ? (
              <Button size="sm" variant="danger" onClick={() => onChange("")}>
                <X className="size-4" /> Remove video
              </Button>
            ) : null}
          </div>
          {allowLinks ? (
            <TextField
              label="…or paste a YouTube / Vimeo link"
              value={isLink ? value : ""}
              placeholder="https://www.youtube.com/watch?v=…"
              onChange={(v) => onChange(v.trim())}
            />
          ) : null}
          {warning ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">{warning}</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
      <MediaLibrary
        open={libraryOpen}
        kind="video"
        onClose={() => setLibraryOpen(false)}
        onPick={(item) => onChange(item.url, item.pathname.endsWith(".webm") ? "video/webm" : "video/mp4")}
      />
    </Field>
  );
}

