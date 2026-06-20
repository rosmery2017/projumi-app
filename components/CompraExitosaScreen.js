import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function CompraExitosaScreen({ navigation, route }) {
  const pedidoId = route?.params?.pedidoId || 'Pendiente';
  const total = route?.params?.total;
  const metodoPago = route?.params?.metodoPago || 'No definido';
  const deliveryMode =
    route?.params?.deliveryMode === 'delivery' ? 'Delivery' : 'Envío nacional';
  const empresaEnvio = route?.params?.empresaEnvio || null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color="#16a34a" />
        </View>
        <Text style={styles.title}>Compra registrada</Text>
        <Text style={styles.subtitle}>
          Tu pedido ya fue enviado al backend y quedó listo para su seguimiento.
        </Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pedido</Text>
            <Text style={styles.summaryValue}>#{pedidoId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pago</Text>
            <Text style={styles.summaryValue}>{metodoPago}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={styles.summaryValue}>{deliveryMode}</Text>
          </View>
          {empresaEnvio ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Empresa</Text>
              <Text style={styles.summaryValue}>{empresaEnvio}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Compras')}>
          <Text style={styles.primaryButtonText}>Ver mis compras</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  summaryLabel: {
    color: '#64748b',
    fontWeight: '700',
  },
  summaryValue: {
    color: '#111827',
    fontWeight: '800',
    textAlign: 'right',
    flexShrink: 1,
  },
  primaryButton: {
    backgroundColor: '#14532d',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '800',
  },
});
