export const LOGO_MAX_BYTES = 400_000;
const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
export const IMAGE_UPLOADS = {
  artists: { bucket: 'artist-images', maxBytes: 5_000_000, label: 'Upload artist image', sizeLabel: '5 MB' },
  posts: { bucket: 'post-images', maxBytes: 5_000_000, label: 'Upload cover image', sizeLabel: '5 MB' },
  partners: { bucket: 'partner-logos', maxBytes: LOGO_MAX_BYTES, label: 'Upload logo', sizeLabel: '400 KB' },
};

export function validateImage(file, entity) {
  const options = IMAGE_UPLOADS[entity];
  if (!options) throw new Error('This content type does not support image uploads.');
  if (!extensions[file.type] || !file.size || file.size > options.maxBytes) {
    throw new Error(`Choose a PNG, JPEG, or WebP image up to ${options.sizeLabel}.`);
  }
  return extensions[file.type];
}

export function validateLogo(file) {
  return validateImage(file, 'partners');
}

export async function uploadContentImage(client, file, entity) {
  const extension = validateImage(file, entity);
  const bucketName = IMAGE_UPLOADS[entity].bucket;
  const path = `${crypto.randomUUID()}.${extension}`;
  const bucket = client.storage.from(bucketName);
  const { error } = await bucket.upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return { bucket: bucketName, path, url: bucket.getPublicUrl(path).data.publicUrl };
}

export async function removeContentImage(client, upload) {
  try {
    const { error } = await client.storage.from(upload.bucket).remove([upload.path]);
    if (error) throw error;
  } catch (error) {
    console.warn('An unused image could not be removed:', error.message);
  }
}
