export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Home & Kitchen",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Toys & Hobbies",
  "Sports & Outdoors",
  "Books & Media",
  "Pet Supplies",
  "Automotive",
  "Grocery & Gourmet Food",
  "Baby Essentials",
  "Household Essentials",
  "Office Supplies",
  "Tools & Home Improvement",
  "Furniture",
  "Musical Instruments",
  "Others",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
