/*
  # Create recipe cards table

  1. New Tables
    - `recipe_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `cookbook_id` (uuid, references cookbooks)
      - `recipe_title` (text, required)
      - `rating` (integer, 1-5, required)
      - `text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `recipe_cards` table
    - Add policy for public read access
    - Add policy for authenticated users to create recipe cards
    - Add policy for users to update/delete their own recipe cards
*/

CREATE TABLE IF NOT EXISTS recipe_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cookbook_id uuid NOT NULL REFERENCES cookbooks(id) ON DELETE CASCADE,
  recipe_title text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_cards ENABLE ROW LEVEL SECURITY;

-- Anyone can read recipe cards
CREATE POLICY "Recipe cards are viewable by everyone"
  ON recipe_cards
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create recipe cards
CREATE POLICY "Authenticated users can create recipe cards"
  ON recipe_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipe cards
CREATE POLICY "Users can update own recipe cards"
  ON recipe_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own recipe cards
CREATE POLICY "Users can delete own recipe cards"
  ON recipe_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipe_cards_cookbook_id ON recipe_cards(cookbook_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_user_id ON recipe_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_cards_created_at ON recipe_cards(created_at DESC);