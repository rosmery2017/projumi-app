import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

export default function CarritoScreen({ navigation }) {
  const [carrito, setCarrito] = useState([
    { id: 1, nombre: 'Café Artesanal', precio: 8.5, cantidad: 2 },
    { id: 2, nombre: 'Miel Orgánica', precio: 12.0, cantidad: 1 },
    { id: 3, nombre: 'Pan Integral', precio: 4.0, cantidad: 3 },
  ]);

  const total = carrito
    .reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    .toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Carrito de Compras</Text>

      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productInfo}>
              {item.cantidad} x ${item.precio.toFixed(2)}
            </Text>
            <Text style={styles.subtotal}>
              ${(item.cantidad * item.precio).toFixed(2)}
            </Text>
          </View>
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total}</Text>
      </View>

      <TouchableOpacity
        style={styles.btnComprar}
        onPress={() => navigation.navigate('Checkout')}>
        <Text style={styles.btnText}>Realizar Compra</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
  },
  productName: { fontSize: 16, fontWeight: '600' },
  productInfo: { fontSize: 14, color: '#555' },
  subtotal: { fontSize: 16, fontWeight: '600' },
  totalContainer: { marginTop: 15, alignItems: 'flex-end' },
  totalText: { fontSize: 20, fontWeight: 'bold' },
  btnComprar: {
    marginTop: 20,
    backgroundColor: '#14532d',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
