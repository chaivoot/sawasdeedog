// TODO(build-spec): photo limits on /submit ("สูงสุด [จำนวน] รูป" in the mockup).
export const MAX_PHOTOS = 5
/** Per-place photo limit in the admin editor. */
export const MAX_PLACE_PHOTOS = 12
/** Photos are downscaled in the browser before upload; this caps the result. */
export const MAX_PHOTO_MB = 10
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
/** Average stars are shown only once this many people have rated a place. */
export const MIN_RATINGS_TO_SHOW = 3
