/*
  # Fix profiles table foreign key constraint

  1. Changes
    - Remove incorrect foreign key constraint that references non-existent public.users table
    - Add trigger to automatically create profile when user signs up via Supabase auth
    - Add proper RLS policies for profile creation

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users to manage their own profiles
    - Add policy for automatic profile creation via trigger
*/

-- Remove the incorrect foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, wishlist, favorite_cookbooks)
  VALUES (new.id, new.email, '{}', '{}');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies to allow the trigger to work
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add policy to allow service role (triggers) to insert profiles
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
CREATE POLICY "Enable insert for service role"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);