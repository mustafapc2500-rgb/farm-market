/** Read-only API contract for this phase. No private schema or admin mutation methods. */
export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  color_key: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
export type ProductRow = {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  description: string;
  full_description: string;
  price_eur: number;
  currency: "EUR";
  is_available: boolean;
  is_published: boolean;
  is_featured: boolean;
  is_sample: boolean;
  includes: string[];
  illustration_key: string | null;
  created_at: string;
  updated_at: string;
};
export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
export type AdminProduct = Pick<
  ProductRow,
  | "id"
  | "slug"
  | "name"
  | "price_eur"
  | "category_id"
  | "is_available"
  | "is_published"
  | "is_featured"
  | "is_sample"
  | "created_at"
> & { categoryName: string };
