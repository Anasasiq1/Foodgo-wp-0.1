import { apiClient } from '../apiClient';
import { WcStoreProduct, WcCategory } from '../../types/woocommerce';
import { Product, CategoryItem } from '../../types';

export interface ProductQueryParams {
  page?: number;
  per_page?: number;
  category?: string | number;
  search?: string;
  featured?: boolean;
  on_sale?: boolean;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'title' | 'price' | 'popularity' | 'rating';
}

function mapWcProductToFoodgo(wcProduct: WcStoreProduct): Product {
  // Parse numeric price from WooCommerce price object (minor units like 12000 -> 120.00 or string "120.00")
  const rawPriceStr = wcProduct.prices?.price || '0';
  const minorUnit = wcProduct.prices?.currency_minor_unit ?? 2;
  const parsedPrice = parseFloat(rawPriceStr) / Math.pow(10, minorUnit) || parseFloat(rawPriceStr) || 0;

  // Extract main image
  const primaryImage =
    wcProduct.images?.[0]?.src ||
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';

  // Primary category
  const primaryCategory = wcProduct.categories?.[0]?.slug || 'burgers';

  // Extract Foodgo custom metadata if injected by foodgo-headless-core plugin
  const foodgoMeta = wcProduct.foodgo_meta || {};

  return {
    id: String(wcProduct.id),
    name: wcProduct.name,
    subtitle: wcProduct.short_description ? wcProduct.short_description.replace(/<[^>]*>?/gm, '').trim() : 'Fresh & Handcrafted',
    category: primaryCategory,
    price: parsedPrice,
    rating: parseFloat(wcProduct.average_rating) || 4.8,
    prepTime: foodgoMeta.prepTime || '15 - 20 mins',
    description: wcProduct.description ? wcProduct.description.replace(/<[^>]*>?/gm, '').trim() : wcProduct.name,
    image: primaryImage,
    defaultSpice: foodgoMeta.defaultSpice ?? 50,
    defaultPortion: foodgoMeta.defaultPortion ?? 1,
    available: wcProduct.is_in_stock,
    featured: wcProduct.on_sale || false,
    popular: true,
    customOrderEnabled: true,
    curryConfig: foodgoMeta.curryConfig,
    customizationSections: foodgoMeta.customizationSections,
  };
}

export async function fetchProductsFromWc(params: ProductQueryParams = {}): Promise<Product[]> {
  try {
    const wcProducts = await apiClient<WcStoreProduct[]>('/wp-json/wc/store/v1/products', {
      isStoreApi: true,
      params: {
        per_page: params.per_page || 50,
        page: params.page || 1,
        category: params.category,
        search: params.search,
        featured: params.featured ? true : undefined,
        orderby: params.orderby || 'popularity',
      },
    });

    if (Array.isArray(wcProducts) && wcProducts.length > 0) {
      return wcProducts.map(mapWcProductToFoodgo);
    }
  } catch (error) {
    // If Store API fails, caller can fallback to local items
    console.warn('WooCommerce Store API fetch products fallback:', error);
  }
  return [];
}

export async function fetchProductByIdFromWc(id: string | number): Promise<Product | null> {
  try {
    const wcProduct = await apiClient<WcStoreProduct>(`/wp-json/wc/store/v1/products/${id}`, {
      isStoreApi: true,
    });
    if (wcProduct && wcProduct.id) {
      return mapWcProductToFoodgo(wcProduct);
    }
  } catch (error) {
    console.warn(`Failed to fetch WooCommerce product ID ${id}:`, error);
  }
  return null;
}

export async function fetchCategoriesFromWc(): Promise<CategoryItem[]> {
  try {
    const wcCats = await apiClient<WcCategory[]>('/wp-json/wc/store/v1/products/categories', {
      isStoreApi: true,
      params: { per_page: 50 },
    });

    if (Array.isArray(wcCats) && wcCats.length > 0) {
      return wcCats.map((cat, idx) => ({
        id: cat.slug || String(cat.id),
        name: cat.name,
        icon: getCategoryIconSlug(cat.slug),
        order: idx + 1,
        active: true,
      }));
    }
  } catch (error) {
    console.warn('WooCommerce Store API fetch categories fallback:', error);
  }
  return [];
}

function getCategoryIconSlug(slug?: string): string {
  const lower = (slug || '').toLowerCase();
  if (lower.includes('burger')) return 'burger';
  if (lower.includes('pizza')) return 'pizza';
  if (lower.includes('drink') || lower.includes('beverage')) return 'drink';
  if (lower.includes('dessert') || lower.includes('sweet')) return 'dessert';
  if (lower.includes('curry') || lower.includes('gravy')) return 'curry';
  if (lower.includes('side') || lower.includes('snack')) return 'side';
  return 'utensils';
}
