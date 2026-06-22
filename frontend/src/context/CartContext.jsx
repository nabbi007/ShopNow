import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as api from "../api/client";

const CartContext = createContext(null);

const SESSION_KEY = "shopnow_session_id";

export function CartProvider({ children }) {
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem(SESSION_KEY)
  );
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = useCallback((id) => {
    if (id) {
      localStorage.setItem(SESSION_KEY, id);
      setSessionId(id);
    }
  }, []);

  // Load existing cart on first mount if we already have a session.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getCart(sessionId);
        if (!cancelled) setCart({ items: data.items, total: data.total });
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.addToCart(productId, quantity, sessionId);
        persistSession(data.session_id);
        setCart({ items: data.items, total: data.total });
        return true;
      } catch (e) {
        setError(e.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, persistSession]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (!sessionId) return;
      try {
        const data = await api.updateCartItem(sessionId, productId, quantity);
        setCart({ items: data.items, total: data.total });
      } catch (e) {
        setError(e.message);
      }
    },
    [sessionId]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!sessionId) return;
      try {
        const data = await api.removeCartItem(sessionId, productId);
        setCart({ items: data.items, total: data.total });
      } catch (e) {
        setError(e.message);
      }
    },
    [sessionId]
  );

  const emptyCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await api.clearCart(sessionId);
      setCart({ items: data.items, total: data.total });
    } catch (e) {
      setError(e.message);
    }
  }, [sessionId]);

  // Places an order from the current cart. On success the backend deletes the
  // cart from Redis, so we reset local state. Returns the created order, or
  // throws so the caller can surface the error message.
  const checkout = useCallback(
    async ({ customerName, customerEmail, shippingAddress }) => {
      if (!sessionId) throw new Error("No active cart session");
      const order = await api.placeOrder({
        customerName,
        customerEmail,
        shippingAddress,
        sessionId,
      });
      setCart({ items: [], total: 0 });
      return order;
    },
    [sessionId]
  );

  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        error,
        addToCart,
        updateItem,
        removeItem,
        emptyCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
