import { supabase } from '../lib/supabase';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('cookbook-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('cookbook-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const deleteImage = async (url: string): Promise<void> => {
  // Extract file path from URL
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex(part => part === 'cookbook-images');
  
  if (bucketIndex === -1) return;
  
  const filePath = urlParts.slice(bucketIndex + 1).join('/');
  
  const { error } = await supabase.storage
    .from('cookbook-images')
    .remove([filePath]);

  if (error) throw error;
};