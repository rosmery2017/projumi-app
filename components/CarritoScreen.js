import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useCart } from './../context/CartContext';

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function CarritoScreen({ navigation }) {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (!items.length) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de continuar.');
      return;
    }

    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito de Compras</Text>

      {items.length ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const stockDisponible = Number(item.stock);
            const canIncrease =
              !Number.isFinite(stockDisponible) || stockDisponible <= 0
                ? true
                : item.quantity < stockDisponible;

            return (
            <View style={styles.item}>
              {item.imagen ? (
                <Image source={{ uri: item.imagen }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
              )}

              <View style={styles.itemBody}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.nombre}
                </Text>
                <Text style={styles.productInfo}>
                  {formatPrice(item.precio)} c/u
                </Text>
                <Text style={styles.productStock}>
                  Stock disponible: {Number.isFinite(stockDisponible) && stockDisponible > 0 ? stockDisponible : 'Sin límite'}
                </Text>
                <Text style={styles.subtotal}>
                  Subtotal: {formatPrice(item.precio * item.quantity)}
                </Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantity}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={[
                      styles.qtyButton,
                      !canIncrease && styles.qtyButtonDisabled,
                    ]}
                    onPress={() =>
                      canIncrease && updateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={!canIncrease}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.removeButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Ve a la sección de productos para agregar artículos.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Productos')}>
            <Text style={styles.emptyButtonText}>Ir a productos</Text>
          </TouchableOpacity>
        </View>
      )}

      {items.length ? (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalText}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>Vaciar carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Continuar compra</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: '#e2e8f0',
  },
  itemBody: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  productInfo: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  subtotal: {
    fontSize: 14,
    color: '#14532d',
    fontWeight: '600',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#14532d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  quantity: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  removeButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  removeButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: '#14532d',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#14532d',
  },
  clearButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButtonText: {
    color: '#374151',
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: '#14532d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
