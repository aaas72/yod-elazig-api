import slugifyLib from 'slugify';

/**
 * Create a URL-friendly slug from a string.
 */
export const createSlug = (text: string): string => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};
