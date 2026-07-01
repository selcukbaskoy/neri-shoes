"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  size: number;
  quantity: number;
  unitPrice: number; // always TRY
  maxQuantity: number; // stock limit at add-time
}

// Runtime-only stock validation state (not persisted)
// key: `${productId}-${size}`, value: live quantity from Supabase
type StockMap = Record<string, number>;

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  // Stock validation
  stockMap: StockMap;
  hasStockIssues: boolean;
  isValidatingStock: boolean;
  validateStock: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "neri_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const validateStock = useCallback(async () => {
    if (!items.length) return;
    setIsValidatingStock(true);
    try {
      const res = await fetch("/api/cart/validate-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, size: i.size })),
        }),
      });
      if (!res.ok) return;
      const { results } = await res.json() as {
        results: Array<{ productId: string; size: number; quantity: number }>;
      };
      const map: StockMap = {};
      for (const r of results) {
        map[`${r.productId}-${r.size}`] = r.quantity;
      }
      setStockMap(map);
    } catch {
      // network error — keep existing stockMap, don't block checkout
    } finally {
      setIsValidatingStock(false);
    }
  }, [items]);

  // Validate when cart opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      validateStock();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasStockIssues = useMemo(() => {
    if (!Object.keys(stockMap).length) return false;
    return items.some((item) => {
      const live = stockMap[`${item.productId}-${item.size}`];
      return live !== undefined && live < item.quantity;
    });
  }, [items, stockMap]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );
      if (idx === -1) {
        return [...prev, { ...newItem, quantity: 1 }];
      }
      const existing = prev[idx];
      if (existing.quantity >= existing.maxQuantity) return prev;
      const updated = [...prev];
      updated[idx] = { ...existing, quantity: existing.quantity + 1 };
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string, size: number) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size))
    );
    setStockMap((prev) => {
      const next = { ...prev };
      delete next[`${productId}-${size}`];
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: number, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => !(i.productId === productId && i.size === size))
        );
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (i.productId !== productId || i.size !== size) return i;
          return { ...i, quantity: Math.min(quantity, i.maxQuantity) };
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setStockMap({});
  }, []);

  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        totalCount,
        isOpen,
        setOpen,
        stockMap,
        hasStockIssues,
        isValidatingStock,
        validateStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
