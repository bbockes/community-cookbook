export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          wishlist: string[];
          favorite_cookbooks: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          wishlist?: string[];
          favorite_cookbooks?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          wishlist?: string[];
          favorite_cookbooks?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      cookbooks: {
        Row: {
          id: string;
          title: string;
          author: string;
          description: string;
          image_url: string;
          affiliate_link: string;
          cuisine: string;
          cooking_method: string;
          favorites: number;
          created_at: string;
          updated_at: string;
          submitted_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          description?: string;
          image_url?: string;
          affiliate_link?: string;
          cuisine?: string;
          cooking_method?: string;
          favorites?: number;
          created_at?: string;
          updated_at?: string;
          submitted_by?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          description?: string;
          image_url?: string;
          affiliate_link?: string;
          cuisine?: string;
          cooking_method?: string;
          favorites?: number;
          created_at?: string;
          updated_at?: string;
          submitted_by?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          cookbook_id: string;
          rating: number;
          text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cookbook_id: string;
          rating: number;
          text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cookbook_id?: string;
          rating?: number;
          text?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipe_cards: {
        Row: {
          id: string;
          user_id: string;
          cookbook_id: string;
          recipe_title: string;
          rating: number;
          text: string;
          image_url: string;
          overall_outcome_text: string;
          would_make_again_text: string;
          what_to_do_differently_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cookbook_id: string;
          recipe_title: string;
          rating: number;
          text?: string;
          image_url?: string;
          overall_outcome_text?: string;
          would_make_again_text?: string;
          what_to_do_differently_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cookbook_id?: string;
          recipe_title?: string;
          rating?: number;
          text?: string;
          image_url?: string;
          overall_outcome_text?: string;
          would_make_again_text?: string;
          what_to_do_differently_text?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}