import { supabase } from "../../lib/supabase";

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 900;
const WEBP_QUALITY = 0.82;

export async function resizeImageToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas nicht verfügbar."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Bild konnte nicht verarbeitet werden."));
            return;
          }
          resolve(blob);
        },
        "image/webp",
        WEBP_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Bild konnte nicht geladen werden."));
    };

    img.src = objectUrl;
  });
}

export async function uploadRecipeImage(
  userId: string,
  file: File,
): Promise<string> {
  const resized = await resizeImageToWebP(file);
  const fileName = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, resized, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error("Bild-Upload fehlgeschlagen: " + error.message);
  }

  const { data } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteRecipeImage(imageUrl: string): Promise<void> {
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split("/recipe-images/");
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];
  await supabase.storage.from("recipe-images").remove([filePath]);
}
