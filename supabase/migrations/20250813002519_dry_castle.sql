/*
  # Add text fields for recipe card questions

  1. New Columns
    - `overall_outcome_text` - How did it turn out overall?
    - `would_make_again_text` - Would you make it again?
    - `what_to_do_differently_text` - What would you do differently next time?

  2. Changes
    - Added three new optional text fields to recipe_cards table
    - Each field allows users to provide detailed responses to specific questions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_cards' AND column_name = 'overall_outcome_text'
  ) THEN
    ALTER TABLE recipe_cards ADD COLUMN overall_outcome_text text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_cards' AND column_name = 'would_make_again_text'
  ) THEN
    ALTER TABLE recipe_cards ADD COLUMN would_make_again_text text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_cards' AND column_name = 'what_to_do_differently_text'
  ) THEN
    ALTER TABLE recipe_cards ADD COLUMN what_to_do_differently_text text DEFAULT '';
  END IF;
END $$;