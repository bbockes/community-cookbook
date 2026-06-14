import { getCollectionKey } from './collections.mjs';
import { CUISINE_RULES } from './cuisineCollections.mjs';
import { METHOD_RULES } from './methodCollections.mjs';

/** Related keywords must appear in the cookbook title only (see foodTypeHaystack). */
const FOOD_TYPE_RULES = [
  {
    name: 'Breakfast',
    keywords: ['breakfast', 'brunch', 'pancake', 'pancakes', 'waffle', 'waffles', 'omelette', 'granola'],
  },
  {
    name: 'Desserts',
    keywords: ['dessert', 'desserts', 'cake', 'cakes', 'pie', 'pies', 'pastry', 'pastries', 'chocolate', 'sweet', 'sweets'],
  },
  {
    name: 'Soups & Stews',
    keywords: ['soup', 'soups', 'stew', 'stews', 'broth', 'chowder', 'bisque', 'gumbo', 'chili'],
  },
  {
    name: 'Vegetarian',
    keywords: ['vegetarian', 'veggie', 'meatless', 'vegetable', 'vegetables'],
  },
  {
    name: 'Vegan',
    keywords: ['vegan', 'plant-based', 'plant based', 'dairy-free', 'dairy free'],
  },
  {
    name: 'Seafood',
    keywords: ['seafood', 'fish', 'shellfish', 'salmon', 'shrimp', 'crab', 'lobster', 'oyster'],
  },
  {
    name: 'Pasta & Noodles',
    keywords: ['pasta', 'noodle', 'noodles', 'spaghetti', 'lasagna', 'ramen', 'udon', 'macaroni'],
  },
  {
    name: 'Salads',
    keywords: ['salad', 'salads', 'caesar', 'slaw', 'coleslaw'],
  },
  {
    name: 'Snacks & Appetizers',
    keywords: ['snack', 'snacks', 'appetizer', 'appetizers', 'tapas', 'finger food', 'hors d\'oeuvre'],
  },
  {
    name: 'Sandwiches & Burgers',
    keywords: ['sandwich', 'sandwiches', 'burger', 'burgers', 'panini', 'slider', 'sliders'],
  },
  {
    name: 'BBQ',
    keywords: ['bbq', 'barbecue', 'barbeque', 'grilled', 'ribs', 'brisket'],
  },
  {
    name: 'Pizza',
    keywords: ['pizza', 'pizzeria', 'neapolitan', 'flatbread'],
  },
  {
    name: 'Ice Cream',
    keywords: ['ice cream', 'gelato', 'sorbet', 'sundae', 'frozen yogurt'],
  },
  {
    name: 'Bread & Baking',
    keywords: ['bread', 'sourdough', 'bagel', 'brioche', 'croissant', 'baking'],
  },
  {
    name: 'Tacos',
    keywords: ['taco', 'tacos', 'taqueria', 'quesadilla', 'burrito', 'enchilada'],
  },
  {
    name: 'Chicken & Poultry',
    keywords: ['chicken', 'poultry', 'turkey', 'duck', 'rotisserie'],
  },
  {
    name: 'Cookies & Candy',
    keywords: ['cookie', 'cookies', 'candy', 'brownie', 'brownies', 'fudge', 'truffle', 'truffles'],
  },
  {
    name: 'Drinks & Cocktails',
    keywords: ['cocktail', 'cocktails', 'beverage', 'mixology', 'wine', 'beer', 'coffee', 'tea', 'smoothie'],
  },
];

function normalizeHaystack(cookbook) {
  const categories = cookbook.categories ?? (cookbook.category ? [cookbook.category] : []);
  return [
    cookbook.title,
    cookbook.description,
    ...categories,
    ...(cookbook.authors ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Cookbook title only — used for food type tagging. */
function foodTypeHaystack(cookbook) {
  return (cookbook.title ?? '').toLowerCase();
}

function matchesAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword));
}

/** Infer browse collections from Google Books metadata. */
export function inferCollections(cookbook) {
  const keys = new Set([getCollectionKey('all', null, null)]);
  const haystack = normalizeHaystack(cookbook);

  keys.add(getCollectionKey('cuisines', null, null));
  keys.add(getCollectionKey('methods', null, null));
  keys.add(getCollectionKey('authors', null, null));
  keys.add(getCollectionKey('foodTypes', null, null));

  for (const { name, keywords } of CUISINE_RULES) {
    if (matchesAny(haystack, keywords)) {
      keys.add(getCollectionKey('cuisines', name, null));
    }
  }

  for (const { name, keywords } of METHOD_RULES) {
    if (matchesAny(haystack, keywords)) {
      keys.add(getCollectionKey('methods', name, null));
    }
  }

  for (const authorName of cookbook.authors ?? []) {
    const name = authorName?.trim();
    if (name && name !== 'Unknown author') {
      keys.add(getCollectionKey('authors', name, null));
    }
  }

  for (const { name, keywords } of FOOD_TYPE_RULES) {
    if (matchesAny(foodTypeHaystack(cookbook), keywords)) {
      keys.add(getCollectionKey('foodTypes', name, null));
    }
  }

  return [...keys];
}
