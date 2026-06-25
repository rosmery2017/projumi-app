import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './../context/AuthContext';
import { buildApiUrl } from './../config/api';
import useFetch from './../hooks/useFetch';
import { getDisplayName } from './../utils/userDisplay';

const PEDIDOS_PATH = '/pedidos/mostrarPedidos';
const PEDIDO_DETALLE_PATH = '/pedidos/consultarPedido';

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const readJsonSafely = async (response) => {
  const text = await response.text();
  const normalizedText = text.replace(/^\uFEFF/, '').trim();

  if (!normalizedText) {
    return null;
  }

  try {
    return JSON.parse(normalizedText);
  } catch {
    return { message: normalizedText };
  }
};

const statusColor = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('aprob')) return '#166534';
  if (normalized.includes('pend')) return '#b45309';
  if (normalized.includes('cancel')) return '#b91c1c';
  if (normalized.includes('env')) return '#1d4ed8';
  return '#475569';
};

export default function ComprasScreen({ navigation }) {
  const { user, token, isReady } = useAuth();
  const displayName = getDisplayName(user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const authHeaders = useMemo(() => {
    const headers = { Accept: 'application/json' };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  const pedidosUrl = buildApiUrl(PEDIDOS_PATH);
  const { data, loading, error, refetch } = useFetch(
    pedidosUrl,
    { method: 'GET', headers: authHeaders },
    Boolean(isReady)
  );

  const pedidos = useMemo(() => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, [data]);

  const loadPedidoDetalle = async (pedido) => {
    if (!pedido?.id_pedidos) {
      return;
    }

    setSelectedPedido(pedido);
    setPedidoDetalle(null);
    setDetalleError(null);
    setDetalleLoading(true);
    setModalVisible(true);

    try {
      const response = await fetch(
        buildApiUrl(`${PEDIDO_DETALLE_PATH}?idPedido=${pedido.id_pedidos}`),
        {
          method: 'GET',
          headers: authHeaders,
        }
      );

      const payload = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          payload?.message || payload?.error || `HTTP ${response.status}`
        );
      }

      if (!payload?.success) {
        throw new Error(payload?.message || 'No se pudo cargar el detalle del pedido.');
      }

      setPedidoDetalle(payload);
    } catch (err) {
      setDetalleError(err?.message || 'No se pudo cargar el detalle del pedido.');
    } finally {
      setDetalleLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
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
          <Ionicons name="cloud-offline-outline" size={42} color="#b91c1c" />
          <Text style={styles.centerTitle}>No pudimos cargar tus pedidos</Text>
          <Text style={styles.centerText}>{error.message || 'Intenta de nuevo.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerState}>
        <Ionicons name="receipt-outline" size={46} color="#94a3b8" />
        <Text style={styles.centerTitle}>Aun no tienes pedidos</Text>
        <Text style={styles.centerText}>
          Aqui veras el historial de compras del usuario {displayName}.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('Productos')}>
          <Text style={styles.retryButtonText}>Ir a productos</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="bag-check-outline" size={34} color="#14532d" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mis compras</Text>
          <Text style={styles.subtitle}>
            Historial del usuario {displayName}.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={18} color="#14532d" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id_pedidos)}
        contentContainerStyle={[
          styles.listContent,
          pedidos.length === 0 ? { flexGrow: 1 } : null,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14532d" />
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => loadPedidoDetalle(item)}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderId}>Pedido #{item.id_pedidos}</Text>
                <Text style={styles.orderDate}>{item.fecha_pedido}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.estatus)}20` }]}>
                <Text style={[styles.statusText, { color: statusColor(item.estatus) }]}>
                  {item.estatus}
                </Text>
              </View>
            </View>

            <Text style={styles.meta}>
              Emprendedor: <Text style={styles.metaStrong}>{item.emprendedor_nombre}</Text>
            </Text>
            <Text style={styles.meta}>
              Total: <Text style={styles.totalText}>{formatPrice(item.total_pedido)}</Text>
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.viewDetailText}>Ver detalle</Text>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Pedido #{selectedPedido?.id_pedidos || ''}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
            </View>

            {detalleLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#14532d" />
                <Text style={styles.centerText}>Cargando detalle...</Text>
              </View>
            ) : detalleError ? (
              <View style={styles.centerState}>
                <Ionicons name="alert-circle-outline" size={42} color="#b91c1c" />
                <Text style={styles.centerTitle}>No se pudo cargar el detalle</Text>
                <Text style={styles.centerText}>{detalleError}</Text>
              </View>
            ) : pedidoDetalle ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Fecha</Text>
                  <Text style={styles.summaryValue}>{pedidoDetalle.pedido?.fecha_pedido}</Text>

                  <Text style={styles.summaryLabel}>Estado</Text>
                  <Text style={styles.summaryValue}>{pedidoDetalle.pedido?.estatus}</Text>

                  <Text style={styles.summaryLabel}>Cliente</Text>
                  <Text style={styles.summaryValue}>
                    {pedidoDetalle.pedido?.cliente_nombre} {pedidoDetalle.pedido?.cliente_apellido}
                  </Text>

                  <Text style={styles.summaryLabel}>Correo</Text>
                  <Text style={styles.summaryValue}>{pedidoDetalle.pedido?.correo}</Text>
                </View>

                <Text style={styles.sectionTitle}>Productos</Text>
                {pedidoDetalle.detalle_productos?.map((prod, index) => (
                  <View key={`${prod.nombre_producto}-${index}`} style={styles.productRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{prod.nombre_producto}</Text>
                      <Text style={styles.productMeta}>Categoria: {prod.categoria}</Text>
                      <Text style={styles.productMeta}>Cantidad: {prod.cantidad}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.productMeta}>
                        {formatPrice(prod.precio_unitario)} c/u
                      </Text>
                      <Text style={styles.productTotal}>
                        {formatPrice(prod.total_producto)}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total pedido</Text>
                  <Text style={styles.totalValue}>
                    {formatPrice(pedidoDetalle.pedido?.total)}
                  </Text>
                </View>
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
  iconWrap: {
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
    fontSize: 13,
    color: '#64748b',
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
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  orderId: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  orderDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 12,
  },
  meta: {
    fontSize: 14,
    color: '#475569',
    marginTop: 3,
  },
  metaStrong: {
    color: '#111827',
    fontWeight: '700',
  },
  totalText: {
    color: '#14532d',
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  viewDetailText: {
    color: '#64748b',
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  centerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#14532d',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  summaryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    marginTop: 3,
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  productTotal: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '900',
    color: '#14532d',
  },
  totalBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532d',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#14532d',
  },
});
