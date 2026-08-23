"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICONS, IconButton } from "@/components/ui/IconButton";
import { useToast } from "@/components/ui/Toast";
import { deleteAccountImage } from "@/functions/accountImages/deleteAccountImage";
import { setCoverImage } from "@/functions/accountImages/setCoverImage";
import { updateImageOrder } from "@/functions/accountImages/updateImageOrder";
import { uploadAccountImage } from "@/functions/accountImages/uploadAccountImage";
import { cn } from "@/lib/utils/cn";
import {
  ACCEPTED_TYPES,
  MAX_INPUT_BYTES,
  compressImage,
  formatBytes,
} from "@/lib/utils/compressImage";
import { imagePublicUrl } from "@/lib/utils/imagePublicUrl";
import type { AccountImage } from "@/types/accountImage";

type Progress = {
  name: string;
  state: "compressing" | "uploading" | "done" | "failed";
  message?: string;
};

/**
 * Screenshot management: add, reorder, choose the cover, remove.
 *
 * Reordering uses explicit move-up / move-down buttons rather than drag and
 * drop. Drag is faster with a mouse, but it is close to unusable with a
 * keyboard and awkward on a phone — and this screen is used on both. The
 * buttons work everywhere and are announced properly by a screen reader.
 *
 * Order is written as the full 0..n-1 sequence after each move, so an
 * interrupted reorder cannot leave gaps or duplicates.
 */
export function ImageUploader({
  accountId,
  initialImages,
}: {
  accountId: string;
  initialImages: AccountImage[];
}) {
  const [images, setImages] = useState<AccountImage[]>(initialImages);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AccountImage | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const persistOrder = async (next: AccountImage[]) => {
    const result = await updateImageOrder(next.map((image) => image.id));
    if (!result.ok) {
      toast.error(result.message);
      router.refresh();
      return false;
    }
    return true;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    startUpload(async () => {
      setProgress(files.map((file) => ({ name: file.name, state: "compressing" })));

      // Sequential, not parallel. Ten phone screenshots uploaded at once
      // saturate a mobile connection and each one gets slower; one at a time
      // gives honest per-file progress and a predictable finish.
      let order = images.length;
      let hasCover = images.some((image) => image.is_cover);
      const added: AccountImage[] = [];

      for (const [index, file] of files.entries()) {
        const update = (state: Progress["state"], message?: string) =>
          setProgress((current) =>
            current.map((item, i) =>
              i === index ? { ...item, state, message } : item,
            ),
          );

        if (!ACCEPTED_TYPES.includes(file.type)) {
          update("failed", "Not an image file.");
          continue;
        }

        if (file.size > MAX_INPUT_BYTES) {
          update("failed", `Too large (${formatBytes(file.size)}). Maximum 15 MB.`);
          continue;
        }

        const { file: prepared, compressed } = await compressImage(file);
        update(
          "uploading",
          compressed
            ? `${formatBytes(file.size)} → ${formatBytes(prepared.size)}`
            : formatBytes(prepared.size),
        );

        const result = await uploadAccountImage({
          accountId,
          file: prepared,
          displayOrder: order,
          // The first screenshot on a listing with no cover becomes the cover,
          // so a gallery is never left without one.
          isCover: !hasCover,
        });

        if (!result.ok) {
          update("failed", result.message);
          continue;
        }

        if (!hasCover) hasCover = true;
        order += 1;
        added.push(result.image);
        update("done");
      }

      if (added.length > 0) {
        setImages((current) => [...current, ...added]);
        toast.success(
          added.length === 1
            ? "Screenshot uploaded."
            : `${added.length} screenshots uploaded.`,
        );
        router.refresh();
      }

      const failed = files.length - added.length;
      if (failed > 0) {
        toast.error(
          failed === 1
            ? "One file could not be uploaded."
            : `${failed} files could not be uploaded.`,
        );
      }

      // Leave failures on screen to be read; clear a clean run automatically.
      if (failed === 0) {
        window.setTimeout(() => setProgress([]), 1200);
      }

      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];

    const reordered = next.map((image, position) => ({
      ...image,
      display_order: position,
    }));

    const previous = images;
    setImages(reordered);
    setBusyId(reordered[target].id);

    void (async () => {
      const ok = await persistOrder(reordered);
      if (!ok) setImages(previous);
      setBusyId(null);
    })();
  };

  const makeCover = (image: AccountImage) => {
    if (image.is_cover) return;

    const previous = images;
    setImages((current) =>
      current.map((item) => ({ ...item, is_cover: item.id === image.id })),
    );
    setBusyId(image.id);

    void (async () => {
      const result = await setCoverImage({ accountId, imageId: image.id });
      if (!result.ok) {
        setImages(previous);
        toast.error(result.message);
      } else {
        router.refresh();
      }
      setBusyId(null);
    })();
  };

  const confirmDelete = () => {
    const image = pendingDelete;
    if (!image) return;

    setDeleteError(null);

    startDelete(async () => {
      const result = await deleteAccountImage({
        id: image.id,
        storagePath: image.storage_path,
      });

      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }

      const remaining = images
        .filter((item) => item.id !== image.id)
        .map((item, position) => ({ ...item, display_order: position }));

      // If the cover was the one deleted, promote the new first image. A
      // listing with images but no cover would render a blank card in the
      // marketplace.
      if (image.is_cover && remaining.length > 0) {
        remaining[0] = { ...remaining[0], is_cover: true };
        await setCoverImage({ accountId, imageId: remaining[0].id });
      }

      setImages(remaining);
      if (remaining.length > 0) await persistOrder(remaining);

      setPendingDelete(null);
      toast.success("Screenshot deleted.");
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-[length:var(--text-sm)] font-medium tracking-[0.005em] text-ink-3">
            Screenshots
          </h2>
          <p className="text-[length:var(--text-sm)] text-ink-3">
            The cover is shown on listing cards. Everything else appears in the
            gallery, in this order.
          </p>
        </div>
        <span className="tabular text-[length:var(--text-sm)] text-ink-3">
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed px-6 py-8 text-center",
          "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]",
          dragOver
            ? "border-accent bg-accent-soft"
            : "border-[var(--border-strong)] bg-surface-2",
        )}
      >
        <p className="text-ink-2">
          Drag screenshots here, or choose files from your device.
        </p>
        <p className="text-[length:var(--text-sm)] text-ink-3">
          JPG, PNG, WebP or HEIC. Resized and converted to WebP automatically.
        </p>

        <input
          ref={inputRef}
          id="screenshot-input"
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
          loadingLabel="Uploading…"
        >
          Choose files
        </Button>
      </div>

      {/* Per-file progress */}
      {progress.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {progress.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-[length:var(--text-sm)]"
            >
              <span className="min-w-0 flex-1 truncate text-ink-2">{item.name}</span>
              <span
                className={cn(
                  "shrink-0",
                  item.state === "failed" ? "text-danger-ink" : "text-ink-3",
                  item.state === "done" && "text-[var(--success-ink)]",
                )}
              >
                {item.state === "compressing" && "Preparing…"}
                {item.state === "uploading" && (item.message ?? "Uploading…")}
                {item.state === "done" && "Uploaded"}
                {item.state === "failed" && (item.message ?? "Failed")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-surface">
          <EmptyState
            title="No screenshots yet"
            description="Buyers decide from the screenshots. Profile, rank, collection and skins are the four most useful shots to include."
          />
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className={cn(
                "group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-surface",
                "transition-[border-color,opacity] duration-[var(--dur-fast)]",
                image.is_cover ? "border-accent" : "border-[var(--border)]",
                busyId === image.id && "opacity-60",
              )}
            >
              <div className="relative aspect-[16/10] bg-surface-3">
                <Image
                  src={imagePublicUrl(image.storage_path)}
                  alt={image.alt_text ?? `Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
                {image.is_cover && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[length:var(--text-xs)] font-medium text-on-accent">
                    Cover
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-0.5">
                  <IconButton
                    label={`Move screenshot ${index + 1} earlier`}
                    disabled={index === 0 || busyId !== null}
                    onClick={() => move(index, -1)}
                  >
                    {ICONS.chevronLeft}
                  </IconButton>
                  <IconButton
                    label={`Move screenshot ${index + 1} later`}
                    disabled={index === images.length - 1 || busyId !== null}
                    onClick={() => move(index, 1)}
                  >
                    {ICONS.chevronRight}
                  </IconButton>
                </div>

                <div className="flex items-center gap-0.5">
                  {!image.is_cover && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId !== null}
                      onClick={() => makeCover(image)}
                      className="px-1.5 text-[length:var(--text-xs)]"
                    >
                      Cover
                      <span className="sr-only">
                        {" "}
                        — make screenshot {index + 1} the cover
                      </span>
                    </Button>
                  )}
                  <IconButton
                    label={`Delete screenshot ${index + 1}`}
                    disabled={busyId !== null}
                    tone="danger"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(image);
                    }}
                  >
                    {ICONS.trash}
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this screenshot?"
        confirmLabel="Delete screenshot"
        confirmingLabel="Deleting…"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        <p>
          The image file will be permanently removed from storage.
          {pendingDelete?.is_cover && images.length > 1
            ? " The next screenshot will become the cover."
            : ""}{" "}
          This cannot be undone.
        </p>
      </ConfirmDialog>
    </section>
  );
}

