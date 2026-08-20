import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  UserProfile,
  PaymentCard,
  Order,
  ChatMessage,
  AppScreen,
  AppModule,
  CurryOption,
} from '../types';
import {
  PRODUCTS as DEFAULT_PRODUCTS,
  INITIAL_USER,
  INITIAL_PAYMENT_CARDS,
  INITIAL_SUPPORT_MESSAGES,
  INITIAL_ORDERS,
} from '../data/products';
import { fetchFoodgoConfig } from '../services/configService';
import { fetchProductsFromWc, fetchCategoriesFromWc } from '../services/woocommerce/productsApi';
import { addToWcCart, clearWcCart as clearWcCartService } from '../services/woocommerce/cartApi';
import { processWcCheckout } from '../services/woocommerce/checkoutApi';
import { fetchCustomerOrders } from '../services/woocommerce/ordersApi';
import { getCurrentUserFromWordPress } from '../services/auth/authService';
import { getRuntimeConfig } from '../config/runtimeConfig';

export interface CategoryItem {
  id: string;
  name: string;
  order: number;
  active: boolean;
  moduleId?: string;
}

const DEFAULT_MODULES: AppModule[] = [
  {
    id: 'food',
    name: 'Food',
    title: 'Foodgo Gourmet Kitchen',
    subtitle: 'Powered by WooCommerce',
    tagline: 'Order handcrafted gourmet burgers & meals!',
    icon: '🍔',
    order: 1,
    active: true,
    bannerTitle: 'Customize Your Burger',
    bannerSubtitle: 'Choose your toppings, sides & spice',
    bannerAction: 'Build Now →',
    bannerBadge: 'Burger Builder',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    title: 'Foodgo Fresh Grocery',
    subtitle: 'Daily Farm Essentials',
    tagline: 'Shop groceries near you',
    icon: '🛒',
    order: 2,
    active: true,
    bannerTitle: 'Fresh Daily Essentials',
    bannerSubtitle: 'Farm fresh produce delivered in 15 mins',
    bannerAction: 'Shop Now →',
    bannerBadge: 'Fresh Groceries',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    title: 'Foodgo Pharmacy',
    subtitle: 'Essential Care',
    tagline: 'Medicines & healthcare delivered',
    icon: '💊',
    order: 3,
    active: true,
    bannerTitle: 'Healthcare & Wellness',
    bannerSubtitle: '100% genuine medicines & first aid',
    bannerAction: 'Explore →',
    bannerBadge: 'Certified Meds',
  },
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All', order: 0, active: true },
  { id: 'burgers', name: 'Burgers', order: 1, active: true },
  { id: 'beverages', name: 'Drinks', order: 2, active: true },
  { id: 'sides', name: 'Sides', order: 3, active: true },
  { id: 'desserts', name: 'Desserts', order: 4, active: true },
];

export interface AppContextType {
  currentScreen: AppScreen;
  navigateTo: (screen: AppScreen, resetHistory?: boolean) => void;
  goBack: () => void;
  screenHistory: AppScreen[];
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  modules: AppModule[];
  activeModule: AppModule;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: CategoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterSpiceLevel: number | null;
  setFilterSpiceLevel: (level: number | null) => void;
  filterPriceRange: [number, number];
  setFilterPriceRange: (range: [number, number]) => void;
  filterSortBy: 'popular' | 'rating' | 'price-asc' | 'price-desc';
  setFilterSortBy: (sort: 'popular' | 'rating' | 'price-asc' | 'price-desc') => void;
  filterOpenNow: boolean;
  setFilterOpenNow: (val: boolean) => void;
  filterFeaturedOnly: boolean;
  setFilterFeaturedOnly: (val: boolean) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  viewProductDetails: (product: Product) => void;
  customizeProduct: (product: Product) => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, portion: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  directCheckoutItem: CartItem | null;
  setDirectCheckoutItem: (item: CartItem) => void;
  clearDirectCheckout: () => void;
  pendingOrder: {
    items: CartItem[];
    subtotal: number;
    taxes: number;
    deliveryFees: number;
    total: number;
    estimatedDelivery: string;
  };
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  paymentCards: PaymentCard[];
  selectedCardType: string;
  setSelectedCardType: (type: string) => void;
  addPaymentCard: (card: Omit<PaymentCard, 'id'>) => void;
  deletePaymentCard: (id: string) => void;
  orders: Order[];
  createOrder: () => Promise<Order>;
  lastPlacedOrder: Order | null;
  isSuccessModalOpen: boolean;
  closeSuccessModal: () => void;
  messages: ChatMessage[];
  unreadSupportCount: number;
  markSupportAsRead: () => void;
  sendTextMessage: (text: string, orderId?: string, orderNumber?: string) => Promise<void>;
  sendVoiceMessage: (
    audioUrl: string,
    duration: number,
    orderId?: string,
    orderNumber?: string
  ) => Promise<void>;
  curries: CurryOption[];
  isWooCommerceConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [screenHistory, setScreenHistory] = useState<AppScreen[]>(['home']);
  const [activeModuleId, setActiveModuleId] = useState<string>('food');
  const [modules, setModules] = useState<AppModule[]>(DEFAULT_MODULES);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSpiceLevel, setFilterSpiceLevel] = useState<number | null>(null);
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 500]);
  const [filterSortBy, setFilterSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc'>('popular');
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('foodgo_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [directCheckoutItem, setDirectCheckoutItemState] = useState<CartItem | null>(null);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>(INITIAL_PAYMENT_CARDS);
  const [selectedCardType, setSelectedCardType] = useState<string>('Cash on Delivery');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_SUPPORT_MESSAGES);
  const [unreadSupportCount, setUnreadSupportCount] = useState<number>(0);
  const [curries, setCurries] = useState<CurryOption[]>([]);
  const [isWooCommerceConnected, setIsWooCommerceConnected] = useState<boolean>(false);

  // Initialize runtime config and discover WordPress backend
  useEffect(() => {
    async function initBackend() {
      try {
        const config = await fetchFoodgoConfig();
        if (config) {
          setIsWooCommerceConnected(true);
          if (config.modules && config.modules.length > 0) {
            setModules(config.modules);
          }
        }
      } catch {
        // Standalone fallback
      }
    }
    initBackend();
  }, []);

  // Fetch live products from WooCommerce
  const syncProducts = useCallback(async () => {
    try {
      const wcProducts = await fetchProductsFromWc();
      if (wcProducts && wcProducts.length > 0) {
        setProducts(wcProducts);
        setIsWooCommerceConnected(true);
      }
    } catch (err) {
      console.warn('Could not sync WooCommerce products:', err);
    }
  }, []);

  // Fetch live categories from WooCommerce
  const syncCategories = useCallback(async () => {
    try {
      const wcCategories = await fetchCategoriesFromWc();
      if (wcCategories && wcCategories.length > 0) {
        setCategories([{ id: 'all', name: 'All', order: 0, active: true }, ...wcCategories]);
      }
    } catch (err) {
      console.warn('Could not sync WooCommerce categories:', err);
    }
  }, []);

  // Fetch customer orders from WordPress / WooCommerce
  const syncOrders = useCallback(async () => {
    try {
      const wcOrders = await fetchCustomerOrders();
      if (wcOrders && wcOrders.length > 0) {
        setOrders(wcOrders);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Fetch authenticated customer profile
  useEffect(() => {
    async function syncUserProfile() {
      try {
        const wpUser = await getCurrentUserFromWordPress();
        if (wpUser) {
          setUser(wpUser);
        }
      } catch {
        // Ignore
      }
    }
    syncUserProfile();
  }, []);

  // Initial load
  useEffect(() => {
    syncProducts();
    syncCategories();
    syncOrders();
  }, [syncProducts, syncCategories, syncOrders]);

  // Screen Navigation
  const navigateTo = (screen: AppScreen, resetHistory = false) => {
    if (resetHistory) {
      setScreenHistory([screen]);
    } else {
      setScreenHistory((prev) => [...prev, screen]);
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('home');
      setScreenHistory(['home']);
    }
  };

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0] || DEFAULT_MODULES[0];

  // Filtering
  const filteredProducts = products.filter((product) => {
    if (product.moduleId && product.moduleId !== activeModuleId) return false;
    if (selectedCategory !== 'all') {
      const catMatch = (product.category || '').toLowerCase() === (selectedCategory || '').toLowerCase();
      if (!catMatch) return false;
    }
    if (searchQuery.trim()) {
      const query = (searchQuery || '').toLowerCase();
      const nameMatch = (product.name || '').toLowerCase().includes(query);
      const subMatch = (product.subtitle || '').toLowerCase().includes(query);
      const descMatch = (product.description || '').toLowerCase().includes(query);
      if (!nameMatch && !subMatch && !descMatch) return false;
    }
    if (filterSpiceLevel !== null && product.defaultSpice > filterSpiceLevel) {
      return false;
    }
    if (product.price < filterPriceRange[0] || product.price > filterPriceRange[1]) {
      return false;
    }
    if (filterFeaturedOnly && !product.featured) {
      return false;
    }
    return true;
  });

  const activeFilterCount =
    (filterSpiceLevel !== null ? 1 : 0) +
    (filterPriceRange[0] > 0 || filterPriceRange[1] < 500 ? 1 : 0) +
    (filterSortBy !== 'popular' ? 1 : 0) +
    (filterOpenNow ? 1 : 0) +
    (filterFeaturedOnly ? 1 : 0);

  const resetFilters = () => {
    setFilterSpiceLevel(null);
    setFilterPriceRange([0, 500]);
    setFilterSortBy('popular');
    setFilterOpenNow(false);
    setFilterFeaturedOnly(false);
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('product-detail');
  };

  const customizeProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateTo('customize');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('foodgo_favs', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Cart operations
  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };
    setCart((prev) => [...prev, newItem]);

    // Asynchronously dispatch to WooCommerce Store API if connected
    try {
      await addToWcCart({
        id: item.productId,
        quantity: item.portion,
        customization: {
          spiceLevel: item.spiceLevel,
          portion: item.portion,
          toppings: item.selectedToppings,
          sides: item.selectedSides,
          curry: item.selectedCurry,
          specialInstructions: item.specialInstructions,
        },
      });
    } catch {
      // Local state is preserved seamlessly
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, portion: number) => {
    if (portion <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const singleItemPrice = item.totalPrice / item.portion;
          return {
            ...item,
            portion,
            totalPrice: Number((singleItemPrice * portion).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setDirectCheckoutItemState(null);
    clearWcCartService().catch(() => {});
  };

  const clearDirectCheckout = () => {
    setDirectCheckoutItemState(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.portion, 0);

  const setDirectCheckoutItem = (item: CartItem) => {
    setDirectCheckoutItemState(item);
    navigateTo('payment');
  };

  // Calculate order totals
  const pendingOrder = (() => {
    if (directCheckoutItem) {
      const subtotal = directCheckoutItem.totalPrice;
      const taxes = Number((subtotal * 0.05).toFixed(2));
      const deliveryFees = 0;
      const total = Number((subtotal + taxes + deliveryFees).toFixed(2));
      return {
        items: [directCheckoutItem],
        subtotal,
        taxes,
        deliveryFees,
        total,
        estimatedDelivery: '15 - 25 mins',
      };
    }
    if (cart.length > 0) {
      const subtotal = Number(cartTotal.toFixed(2));
      const taxes = Number((subtotal * 0.05).toFixed(2));
      const deliveryFees = 0;
      const total = Number((subtotal + taxes + deliveryFees).toFixed(2));
      return {
        items: cart,
        subtotal,
        taxes,
        deliveryFees,
        total,
        estimatedDelivery: '15 - 25 mins',
      };
    }
    const defaultProduct = products[0] || DEFAULT_PRODUCTS[0];
    const defaultItem: CartItem = {
      id: 'default-cart-item',
      productId: defaultProduct.id,
      name: defaultProduct.name,
      subtitle: defaultProduct.subtitle,
      image: defaultProduct.image,
      basePrice: defaultProduct.price,
      portion: 1,
      spiceLevel: 50,
      selectedToppings: [],
      selectedSides: [],
      totalPrice: defaultProduct.price,
    };
    return {
      items: [defaultItem],
      subtotal: defaultProduct.price,
      taxes: Number((defaultProduct.price * 0.05).toFixed(2)),
      deliveryFees: 0,
      total: Number((defaultProduct.price * 1.05).toFixed(2)),
      estimatedDelivery: '15 - 25 mins',
    };
  })();

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const addPaymentCard = (cardData: Omit<PaymentCard, 'id'>) => {
    const newCard: PaymentCard = {
      ...cardData,
      id: 'method-' + Date.now(),
    };
    setPaymentCards((prev) => [...prev, newCard]);
    setSelectedCardType(newCard.type);
  };

  const deletePaymentCard = (id: string) => {
    setPaymentCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Create order via WooCommerce Checkout API
  const createOrder = async (): Promise<Order> => {
    const orderNum = '#WC-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      orderNumber: orderNum,
      date: 'Just now',
      items: pendingOrder.items,
      subtotal: pendingOrder.subtotal,
      taxes: pendingOrder.taxes,
      deliveryFees: pendingOrder.deliveryFees,
      total: pendingOrder.total,
      estimatedDelivery: pendingOrder.estimatedDelivery,
      paymentMethod: selectedCardType,
      status: 'In Transit',
    };

    try {
      // Process through WooCommerce Store Checkout API
      const checkoutRes = await processWcCheckout({
        billing_address: {
          first_name: user.name.split(' ')[0] || 'Customer',
          last_name: user.name.split(' ').slice(1).join(' ') || 'Foodie',
          address_1: user.address || 'Beach Road',
          city: 'Calicut',
          state: 'KL',
          postcode: '673001',
          country: 'IN',
          email: user.email || 'customer@foodgo.com',
          phone: user.phone || '+91 98765 43210',
        },
        payment_method: (selectedCardType || '').toLowerCase().includes('cash') ? 'cod' : 'cod',
      });

      if (checkoutRes && checkoutRes.order_id) {
        newOrder.id = String(checkoutRes.order_id);
        newOrder.orderNumber = `#WC-${checkoutRes.order_id}`;
      }
    } catch {
      // Resilient fallback creates the order locally
    }

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setIsSuccessModalOpen(true);
    clearCart();
    return newOrder;
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigateTo('home', true);
  };

  const markSupportAsRead = () => {
    setUnreadSupportCount(0);
  };

  const sendTextMessage = async (text: string, orderId?: string, orderNumber?: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderType: 'customer',
      senderName: user.name,
      messageType: 'text',
      text: text.trim(),
      time: timeFormatted,
      timestamp: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  const sendVoiceMessage = async (
    audioUrl: string,
    duration: number,
    orderId?: string,
    orderNumber?: string
  ) => {
    if (!audioUrl) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      senderType: 'customer',
      senderName: user.name,
      messageType: 'audio',
      audioUrl,
      audioDuration: duration,
      text: 'Voice message',
      time: timeFormatted,
      timestamp: Date.now(),
      read: true,
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        goBack,
        screenHistory,
        activeModuleId,
        setActiveModuleId,
        modules,
        activeModule,
        selectedCategory,
        setSelectedCategory,
        categories,
        searchQuery,
        setSearchQuery,
        filterSpiceLevel,
        setFilterSpiceLevel,
        filterPriceRange,
        setFilterPriceRange,
        filterSortBy,
        setFilterSortBy,
        filterOpenNow,
        setFilterOpenNow,
        filterFeaturedOnly,
        setFilterFeaturedOnly,
        resetFilters,
        activeFilterCount,
        products,
        filteredProducts,
        selectedProduct,
        setSelectedProduct,
        viewProductDetails,
        customizeProduct,
        favorites,
        toggleFavorite,
        isFavorite,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        cartCount,
        directCheckoutItem,
        setDirectCheckoutItem,
        clearDirectCheckout,
        pendingOrder,
        user,
        updateUser,
        paymentCards,
        selectedCardType,
        setSelectedCardType,
        addPaymentCard,
        deletePaymentCard,
        orders,
        createOrder,
        lastPlacedOrder,
        isSuccessModalOpen,
        closeSuccessModal,
        messages,
        unreadSupportCount,
        markSupportAsRead,
        sendTextMessage,
        sendVoiceMessage,
        curries,
        isWooCommerceConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
