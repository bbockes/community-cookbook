/*
  # Setup Storage Bucket for Images
  
  1. Storage Bucket
    - Create 'cookbook-images' bucket for storing user uploaded images
    - Enable public access for images
    - Set up RLS policies for authenticated uploads
  
  2. Security
    - Only authenticated users can upload
    - Public read access for all images
    - Users can delete their own uploads
*/

-- Create storage bucket for cookbook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cookbook-images', 'cookbook-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cookbook-images');

-- Allow public access to view images
CREATE POLICY "Public access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cookbook-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'cookbook-images' AND auth.uid()::text = owner);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'cookbook-images' AND auth.uid()::text = owner);