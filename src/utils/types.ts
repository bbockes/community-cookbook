import { Database } from '../lib/database.types';

export type DbCookbook = Database['public']['Tables']['cookbooks']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbReview = Database['public']['Tables']['reviews']['Row'];
export type DbRecipeCard = Database['public']['Tables']['recipe_cards']['Row'];

// Legacy type for existing components (will migrate gradually)
export interface Cookbook {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  votes: number;
  tags: string[];
  publishedDate: string;
}