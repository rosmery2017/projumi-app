import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from './../context/AuthContext';
import { getDisplayName } from './../utils/userDisplay';
import {
  fetchEventSaleDetail,
  fetchEventSales,
} from './../services/eventSalesService';

const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusLabel = (value) => {
  if (String(value) === '1') {
    return 'Activo';
  }

  if (String(value) === '0') {
    return 'Inactivo';
  }

  return value || 'Sin estado';
};

const statusColor = (value) => {
  if (String(value) === '1') {
    return '#166534';
  }

  if (String(value) === '0') {
    return '#b91c1c';
  }

  return '#475569';
};

export default function PedidosScreen({ navigation }) {
  const { user, token } = useAuth();
  const displayName = useMemo(() => getDisplayName(user), [user]);

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const loadVentas = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const payload = await fetchEventSales(token);
      setVentas(payload);
      setError(null);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar tus ventas por evento.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadVentas();
    }, [token])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVentas(false);
  };

  const openDetail = async (eventId) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setDetailData(null);
    setDetailError(null);

    try {
      const detail = await fetchEventSaleDetail(eventId, token);
      setDetailData(detail);
    } catch (err) {
      setDetailError(err?.message || 'No se pudo cargar el detalle de la venta.');
    } finally {
      setDetailLoading(false);
    }
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#14532d" />
          <Text style={styles.centerText}>Cargando tus pedidos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={44} color="#b91c1c" />
          <Text style={styles.centerTitle}>No pudimos cargar tus pedidos</Text>
          <Text style={styles.centerText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => loadVentas()}>
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerState}>
        <Ionicons name="file-tray-outline" size={46} color="#94a3b8" />
        <Text style={styles.centerTitle}>Aun no tienes ventas registradas</Text>
        <Text style={styles.centerText}>
          Aqui veras las ventas por evento registradas por {displayName}.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Eventos')}>
          <Text style={styles.primaryButtonText}>Registrar una venta</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="receipt-outline" size={28} color="#14532d" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mis pedidos</Text>
          <Text style={styles.subtitle}>
            Ventas por evento registradas por {displayName}.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color="#14532d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ventas}
        keyExtractor={(item) => String(item.id_evento)}
        contentContainerStyle={[styles.listContent, !ventas.length ? { flexGrow: 1 } : null]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14532d" />
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.saleCard}
            onPress={() => openDetail(item.id_evento)}>
            <View style={styles.saleTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saleTitle}>{item.nombre_evento}</Text>
                <Text style={styles.saleMeta}>
                  {formatDate(item.fecha_inicio)} al {formatDate(item.fecha_fin)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusColor(item.status_evento)}20` },
                ]}>
                <Text style={[styles.statusText, { color: statusColor(item.status_evento) }]}>
                  {statusLabel(item.status_evento)}
                </Text>
              </View>
            </View>

            <Text style={styles.saleMeta}>Direccion: {item.direccion}</Text>
            <Text style={styles.saleAmount}>Total vendido: {formatUsd(item.monto_total)}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLink}>Ver detalle</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={detailVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del pedido</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#14532d" />
                <Text style={styles.centerText}>Cargando detalle...</Text>
              </View>
            ) : detailError ? (
              <View style={styles.centerState}>
                <Ionicons name="alert-circle-outline" size={42} color="#b91c1c" />
                <Text style={styles.centerTitle}>No se pudo cargar el detalle</Text>
                <Text style={styles.centerText}>{detailError}</Text>
              </View>
            ) : detailData ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHero}>
                  <Text style={styles.detailEventName}>{detailData.evento?.nombre_evento}</Text>
                  <Text style={styles.detailMeta}>
                    {formatDate(detailData.evento?.fecha_inicio)} al{' '}
                    {formatDate(detailData.evento?.fecha_fin)}
                  </Text>
                  <Text style={styles.detailMeta}>{detailData.evento?.direccion}</Text>
                  <Text style={styles.detailTotal}>
                    Total registrado: {formatUsd(detailData.evento?.monto_total)}
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Productos vendidos</Text>
                {detailData.detalle_productos?.length ? (
                  detailData.detalle_productos.map((product, index) => (
                    <View
                      key={`${product.id_producto}-${index}`}
                      style={styles.detailProductRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailProductName}>{product.nombre_producto}</Text>
                        <Text style={styles.detailProductMeta}>Cantidad: {product.cantidad}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.detailProductMeta}>
                          {formatUsd(product.precio)} c/u
                        </Text>
                        <Text style={styles.detailProductTotal}>
                          {formatUsd(product.total_producto)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.centerText}>No hay productos registrados.</Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 19,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 28,
  },
  saleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  saleTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  saleTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  saleMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  saleAmount: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#14532d',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLink: {
    fontWeight: '800',
    color: '#14532d',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
  },
  centerTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  centerText: {
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#14532d',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '82%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  detailHero: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  detailEventName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  detailMeta: {
    marginTop: 6,
    color: '#475569',
    lineHeight: 19,
  },
  detailTotal: {
    marginTop: 10,
    fontWeight: '800',
    color: '#14532d',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  detailProductRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailProductName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  detailProductMeta: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
  },
  detailProductTotal: {
    marginTop: 6,
    fontWeight: '900',
    color: '#14532d',
  },
});
