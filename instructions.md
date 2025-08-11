# Bolt.new Cookbook Review Platform: Step-by-Step Guide

Below are simple, detailed instructions to build your **"Product Hunt for cookbooks"** using Bolt.new and free libraries/APIs.
The workflow leverages Bolt's visual builder with minimal custom code, integrating third-party services only when essential.

---- 

## 1. Initial Project Setup

1. Go to [bolt.new][1] and sign up.
2. Start a new project and select **Full-Stack Project** for serverless backend support.

---- 

## 2. Define Data Models

Use Bolt's database interface to create these **collections**:

### **Cookbooks**

- `title` (text)
- `image_url` (text)
- `description` (text)
- `affiliate_link` (text)
- `cuisine` (text)
- `cooking_method` (text)
- `created_at` (date)
- `favorites` (number — count of "hearts")


### **Reviews**

- `user_id` (relation to Users)
- `cookbook_id` (relation to Cookbooks)
- `rating` (number, 1–5)
- `text` (text)
- `created_at` (date)


### **RecipeCards**

- `user_id` (relation to Users)
- `cookbook_id` (relation to Cookbooks)
- `recipe_title` (text)
- `rating` (number, 1–5)
- `text` (text)
- `created_at` (date)


### **Users** (default collection)

- `email`
- `password/hash`
- `wishlist` (array of Cookbook IDs)
- `favorite_cookbooks` (array of Cookbook IDs)

---- 

## 3. Authentication

- Use Bolt's built-in authentication for registration/login.
- Extend the **Users** collection to include `wishlist` and `favorites`.

---- 

## 4. Homepage UI Design

- **Search Bar** — Bind to the **Cookbooks** collection (`title`, `cuisine`, etc.).
- **Filtering \& Sorting**:
	- Dropdowns for cuisine and cooking method.
	- Sorting by "Newest" or "Popular" (weekly, monthly, etc.).
		- Popularity: sort by `favorites`, filter by `created_at`.
- **Infinite Scroll**:
	- Use a List or Grid component with **Infinite Scroll** enabled.

**Cookbook Card Content**:

- Image
- Title
- Short description
- Favorite (heart) button
- "Buy" button (opens `affiliate_link` in new tab)

---- 

## 5. Product Page (Cookbook Detail)

- Clicking a card routes to `/cookbook/:id`
- Display:
	- Large image
	- Full description
	- Purchase button (affiliate link)
- Tabs:
	- **Reviews**: List reviews, allow adding review (logged-in only)
	- **Recipe Cards**: List recipe reviews, allow adding recipe card (logged-in only)
- Use Bolt's **Tabs** component for switching between these views.

---- 

## 6. Logged-In User Features

- **Submit Cookbook**: Form with fields matching the Cookbooks collection.
- **Write Review**: Form in the Reviews tab.
- **Add Recipe Card**: Form in the Recipe Cards tab.
- **Wishlist**: "Add to Wishlist" button updates user's wishlist array.
- **Favorite/Upvote**:
	- Heart icon increases `favorites` count and updates user's favorites array.
	- Only one upvote allowed per user per cookbook.

---- 

## 7. Data Filtering and Sorting

- Use Bolt's built-in query filters.
- For "popular by week/month/year":
	- Either use Bolt's date filtering with `created_at`
	- Or write a backend script to count favorites during that time range.

---- 

## 8. Affiliate Purchase Integration

- "Buy" button links directly to the cookbook's affiliate URL.
- Options:
	- **Amazon Associates**
	- **Bookshop.org API**
	- Any other free affiliate system.

---- 

## 9. Additional Free Libraries/APIs

- **Image Uploads**: Bolt's uploader, or [Cloudinary] / [Imgur].
- **Optional Recipe Data**: [Spoonacular API] for recipe info.
- **UI Styling**: [TailwindCSS] via custom CSS.
- **Email Notifications**: Sendgrid free tier.

---- 

## 10. Launch and Test

1. Test all user flows in **Preview** mode.
2. Deploy using Bolt's **Deploy** button.
3. Use Bolt’s free subdomain or connect your own.

---- 

## Tips for Keeping It Simple

- Use built-in UI components wherever possible.
- Minimize custom scripts—only for advanced popularity metrics.
- Let Bolt handle authentication, database, and routing.

---- 

If you want, I can also turn this into a **fully formatted README.md file** so you can paste it directly into your repo.
Do you want me to do that next?


[1]:	https://bolt.new/