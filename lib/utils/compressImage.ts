/**
 * Resizes and re-encodes a screenshot to WebP before it is uploaded.
 *
 * MLBB screenshots come off a phone at 3–8 MB. Buyers open the public gallery
 * on mobile data, so shipping the original is the difference between a gallery
 * that loads and one that is abandoned. Doing it in the browser means the bytes
 * are never sent twice.
 *
 * Uses only `createImageBitmap` and a canvas — no dependency. If any of it is
 * unavailable or fails, the original file is returned rather than blocking the
 * upload: a large screenshot is much better than no screenshot.
 */

export const MAX_DIMENSION = 1600;
export const WEBP_QUALITY = 0.82;

/** 15 MB. Anything larger is a video or a mistake, not a screenshot. */
export const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export type CompressOutcome = {
  file: File;
  /** False when the original was passed through unchanged. */
  compressed: boolean;
};

function replaceExtension(name: string, extension: string): string {
  return name.replace(/\.[^.]+$/, "") + extension;
}

export async function compressImage(file: File): Promise<CompressOutcome> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return { file, compressed: false };
  }

  try {
    const bitmap = await createImageBitmap(file);

    // Only ever scale down. Enlarging a small screenshot adds bytes and no
    // detail.
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return { file, compressed: false };
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
    });

    if (!blob) {
      return { file, compressed: false };
    }

    // Re-encoding a small PNG of flat colour can make it bigger. Keep whichever
    // is actually smaller, unless the original is not a format we can rely on
    // browsers to render — HEIC from an iPhone must be converted regardless.
    const mustConvert = !["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    );

    if (!mustConvert && blob.size >= file.size) {
      return { file, compressed: false };
    }

    return {
      file: new File([blob], replaceExtension(file.name, ".webp"), {
        type: "image/webp",
        lastModified: Date.now(),
      }),
      compressed: true,
    };
  } catch {
    // An unsupported codec (some HEIC variants) lands here. Upload the
    // original and let the browser decide whether it can display it.
    return { file, compressed: false };
  }
}

/** Human-readable size for the uploader's progress list. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
