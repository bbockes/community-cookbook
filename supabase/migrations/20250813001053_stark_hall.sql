/*
  # Add username field to profiles

  1. Changes
    - Add `username` column to `profiles` table
    - Make username unique and required
    - Add index for performance

  2. Security
    - Username will be publicly visible in reviews
    - No additional RLS policies needed
*/

-- Add username column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text;
  END IF;
END $$;

-- Make username unique and not null
DO $$
BEGIN
  -- First, update any existing profiles with a default username
  UPDATE profiles SET username = 'user_' || substring(id::text, 1, 8) WHERE username IS NULL;
  
  -- Then add the constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);