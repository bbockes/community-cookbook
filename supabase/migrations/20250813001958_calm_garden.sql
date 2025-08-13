/*
  # Add image field to recipe cards

  1. Changes
    - Add `image_url` column to `recipe_cards` table
    - Allow users to upload images or GIFs of their recipe results
    - Field is optional (nullable) with empty string default

  2. Notes
    - Supports both images and GIFs
    - Users can share visual results of recipes they've tried
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_cards' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE recipe_cards ADD COLUMN image_url text DEFAULT '';
  END IF;
END $$;