const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.8;

/**
 * Shrinks a photo before it is stored, so the device holds and sends about
 * 0.5–1 MB instead of a full camera original.
 */
export const resizePhoto = async (
  file: File
): Promise<{data: ArrayBuffer; mime: string; takenAt: string | null}> => {
  const bitmap = await createImageBitmap(file, {imageOrientation: 'from-image'});
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Kunne ikke behandle billedet');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Kunne ikke behandle billedet'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  );
  return {
    data: await blob.arrayBuffer(),
    mime: 'image/jpeg',
    takenAt: file.lastModified ? new Date(file.lastModified).toISOString() : null,
  };
};

/** Thumbnail of a photo the server has, through the existing image proxy. */
export const serverImageUrl = (s3Key: string, size = 640) =>
  `/static/images/${s3Key}?format=auto&width=${size}&height=${size}`;
