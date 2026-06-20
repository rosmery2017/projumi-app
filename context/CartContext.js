import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'projumi_cart_v1';

const CartContext = createContext(null);

const normalizeProduct = (product) => {
  if (!product) {
    return null;
  }

  const id = product.id?.toString?.() || product.id_producto?.toString?.() || '';
  if (!id) {
    return null;
  }

  const precio = Number(product.precio);
  const stock = Number(product.stock);

  return {
    id,
    id_producto: product.id_producto?.toString?.() || id,
    id_emprendedor:
      product.id_emprendedor?.toString?.() ||
      product.id_emprededor?.toString?.() ||
      null,
    id_categoria: product.id_categoria?.toString?.() || null,
    nombre: product.nombre || product.name || 'Producto',
    precio: Number.isFinite(precio) ? precio : 0,
    imagen: product.imagen || null,
    categoria: product.categoria || null,
    descripcion: product.descripcion || null,
    emprendedor: product.emprendedor || null,
    stock: Number.isFinite(stock) ? stock : null,
    quantity: Number(product.quantity) > 0 ? Number(product.quantity) : 1,
    source: product.source || 'backend',
  };
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) {
            setItems(
              parsed
                .map(normalizeProduct)
                .filter(Boolean)
            );
          }
        }
      } catch (error) {
        console.log('No se pudo restaurar el carrito:', error?.message);
      } finally {
        setReady(true);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(
      (error) => {
        console.log('No se pudo guardar el carrito:', error?.message);
      }
    );
  }, [items, ready]);

  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = normalizeProduct({ ...product, quantity });
    if (!normalizedProduct) {
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === normalizedProduct.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + normalizedProduct.quantity }
            : item
        );
      }

      return [...currentItems, normalizedProduct];
    });
  };

  const updateQuantity = (productId, nextQuantity) => {
    const quantity = Number(nextQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + Number(item.precio || 0) * Number(item.quantity || 0), 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const value = {
    items,
    total,
    itemCount,
    ready,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
