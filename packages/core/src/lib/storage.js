import { supabase } from './supabaseClient.js';

/**
 * CleanFlow Centralized Storage Utility
 * Handles image uploads to Supabase Storage buckets.
 */
export const uploadFile = async (bucket, file, folder = '') => {
  try {
    if (!file) return null;

    // 1. Generate unique filename
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // 2. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 3. Return the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error(`[Storage Utility] Upload to ${bucket} failed:`, err);
    throw err;
  }
};
