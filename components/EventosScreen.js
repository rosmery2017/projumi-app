import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './../context/AuthContext';
import { getDisplayName } from './../utils/userDisplay';
import {
  fetchBcvRate,
  fetchCurrenciesByMethod,
  fetchEventProducts,
  fetchEventSaleDetail,
  fetchEventSales,
  fetchEventSalesBootstrap,
  registerEventSale,
} from './../services/eventSalesService';

const createProductRow = (seed = Date.now()) => ({
  id: `product-${seed}-${Math.random().toString(36).slice(2, 7)}`,
  productId: '',
  quantity: '1',
});

const createPaymentRow = (seed = Date.now()) => ({
  id: `payment-${seed}-${Math.random().toString(36).slice(2, 7)}`,
  methodId: '',
  currencyId: '',
  currencyLabel: '',
  amount: '',
});

const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
const formatBs = (value) => `Bs ${Number(value || 0).toFixed(2)}`;
const isBsCurrency = (label = '') => String(label).toLowerCase().includes('bs');

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

const SectionCard = ({ icon, title, subtitle, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={18} color="#14532d" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {children}
  </View>
);

const SaleDetailModal = ({ visible, detail, loading, error, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Detalle de venta</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#14532d" />
            <Text style={styles.centerText}>Cargando detalle...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Ionicons name="alert-circle-outline" size={42} color="#b91c1c" />
            <Text style={styles.centerTitle}>No se pudo cargar el detalle</Text>
            <Text style={styles.centerText}>{error}</Text>
          </View>
        ) : detail ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailHero}>
              <Text style={styles.detailEventName}>{detail.evento?.nombre_evento}</Text>
              <Text style={styles.detailMeta}>
                {formatDate(detail.evento?.fecha_inicio)} al {formatDate(detail.evento?.fecha_fin)}
              </Text>
              <Text style={styles.detailMeta}>{detail.evento?.direccion}</Text>
              <Text style={styles.detailTotal}>
                Total registrado: {formatUsd(detail.evento?.monto_total)}
              </Text>
            </View>

            <Text style={styles.detailSectionTitle}>Productos</Text>
            {detail.detalle_productos?.length ? (
              detail.detalle_productos.map((item, index) => (
                <View key={`${item.id_producto}-${index}`} style={styles.detailProductRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailProductName}>{item.nombre_producto}</Text>
                    <Text style={styles.detailProductMeta}>Cantidad: {item.cantidad}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.detailProductMeta}>
                      {formatUsd(item.precio)} c/u
                    </Text>
                    <Text style={styles.detailProductTotal}>
                      {formatUsd(item.total_producto)}
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
);

export default function EventosScreen({ navigation }) {
  const { user, token } = useAuth();
  const displayName = useMemo(() => getDisplayName(user), [user]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [eventos, setEventos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [currencyOptionsByMethod, setCurrencyOptionsByMethod] = useState({});
  const [loadingCurrencies, setLoadingCurrencies] = useState({});
  const [exchangeRate, setExchangeRate] = useState(0);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [productRows, setProductRows] = useState([createProductRow()]);
  const [paymentRows, setPaymentRows] = useState([createPaymentRow()]);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const loadScreenData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const [bootstrap, productList, ventasList, rate] = await Promise.all([
        fetchEventSalesBootstrap(token),
        fetchEventProducts(token),
        fetchEventSales(token),
        fetchBcvRate(token),
      ]);

      setEventos(bootstrap.eventos);
      setMetodosPago(bootstrap.metodosPago);
      setProductos(productList);
      setVentas(ventasList);
      setExchangeRate(rate);
      setError(null);
    } catch (err) {
      setError(
        err?.message ||
          'No se pudo cargar el modulo de ventas por evento. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScreenData();
  }, [token]);

  const getProductById = (productId) =>
    productos.find((item) => String(item.id_producto) === String(productId));

  const getReservedQuantity = (productId, excludedRowId = null) =>
    productRows.reduce((acc, row) => {
      if (row.id === excludedRowId || row.productId !== productId) {
        return acc;
      }

      return acc + Number(row.quantity || 0);
    }, 0);

  const getAvailableStockForRow = (row) => {
    const product = getProductById(row.productId);
    if (!product) {
      return 0;
    }

    return Math.max(0, Number(product.stock || 0) - getReservedQuantity(row.productId, row.id));
  };

  const normalizedProductRows = useMemo(
    () =>
      productRows.map((row) => {
        const product = getProductById(row.productId);
        const maxAvailable = getAvailableStockForRow(row);
        const quantity = Number(row.quantity || 0);

        return {
          ...row,
          product,
          maxAvailable,
          quantity,
          subtotal: quantity * Number(product?.precio || 0),
        };
      }),
    [productRows, productos]
  );

  const totalProductsAmount = useMemo(
    () =>
      normalizedProductRows.reduce((acc, row) => {
        if (!row.product) {
          return acc;
        }

        return acc + row.subtotal;
      }, 0),
    [normalizedProductRows]
  );

  const paymentTotals = useMemo(() => {
    let totalUsd = 0;
    let totalBs = 0;

    paymentRows.forEach((entry) => {
      const amount = Number(entry.amount || 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      if (isBsCurrency(entry.currencyLabel)) {
        totalBs += amount;
      } else {
        totalUsd += amount;
      }
    });

    const totalEquivalentUsd = totalUsd + (exchangeRate > 0 ? totalBs / exchangeRate : 0);
    const remainingUsd = Math.max(0, totalProductsAmount - totalEquivalentUsd);

    return {
      totalUsd,
      totalBs,
      totalEquivalentUsd,
      remainingUsd,
      remainingBs: exchangeRate > 0 ? remainingUsd * exchangeRate : 0,
    };
  }, [exchangeRate, paymentRows, totalProductsAmount]);

  const canSubmit = useMemo(() => {
    const validEvent = Boolean(selectedEventId);
    const validProducts =
      normalizedProductRows.length > 0 &&
      normalizedProductRows.every(
        (row) =>
          row.product &&
          row.quantity > 0 &&
          row.maxAvailable > 0 &&
          row.quantity <= row.maxAvailable
      );
    const validPayments =
      paymentRows.length > 0 &&
      paymentRows.every(
        (row) =>
          row.methodId &&
          row.currencyId &&
          Number(row.amount || 0) > 0
      );

    return validEvent && validProducts && validPayments && paymentTotals.remainingUsd <= 0.01;
  }, [normalizedProductRows, paymentRows, paymentTotals.remainingUsd, selectedEventId]);

  const loadCurrencies = async (methodId) => {
    if (!methodId || currencyOptionsByMethod[methodId] || loadingCurrencies[methodId]) {
      return;
    }

    setLoadingCurrencies((current) => ({ ...current, [methodId]: true }));
    try {
      const options = await fetchCurrenciesByMethod(methodId, token);
      setCurrencyOptionsByMethod((current) => ({ ...current, [methodId]: options }));
    } catch (err) {
      Alert.alert(
        'Monedas',
        err?.message || 'No se pudieron cargar las monedas para este metodo.'
      );
    } finally {
      setLoadingCurrencies((current) => ({ ...current, [methodId]: false }));
    }
  };

  const updateProductRow = (rowId, updates) => {
    setProductRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    );
  };

  const updatePaymentRow = (rowId, updates) => {
    setPaymentRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    );
  };

  const handleProductSelect = (rowId, productId) => {
    const product = getProductById(productId);
    const reservedByOthers = getReservedQuantity(productId, rowId);
    const available = Math.max(0, Number(product?.stock || 0) - reservedByOthers);

    if (productId && available <= 0) {
      Alert.alert('Sin stock', 'Ese producto ya no tiene unidades disponibles para esta venta.');
      updateProductRow(rowId, { productId: '', quantity: '1' });
      return;
    }

    updateProductRow(rowId, {
      productId,
      quantity: productId ? '1' : '1',
    });
  };

  const handleQuantityChange = (rowId, nextValue) => {
    const currentRow = productRows.find((row) => row.id === rowId);
    if (!currentRow) {
      return;
    }

    const maxAvailable = getAvailableStockForRow(currentRow);
    const parsedValue = Number(String(nextValue).replace(/[^0-9]/g, ''));

    if (!parsedValue) {
      updateProductRow(rowId, { quantity: '' });
      return;
    }

    const normalizedValue = Math.min(Math.max(parsedValue, 1), maxAvailable || 1);
    updateProductRow(rowId, { quantity: String(normalizedValue) });
  };

  const incrementQuantity = (rowId) => {
    const currentRow = productRows.find((row) => row.id === rowId);
    if (!currentRow) {
      return;
    }

    const maxAvailable = getAvailableStockForRow(currentRow);
    const nextValue = Math.min(Number(currentRow.quantity || 0) + 1, maxAvailable);

    if (nextValue === Number(currentRow.quantity || 0)) {
      return;
    }

    updateProductRow(rowId, { quantity: String(Math.max(1, nextValue)) });
  };

  const decrementQuantity = (rowId) => {
    const currentRow = productRows.find((row) => row.id === rowId);
    if (!currentRow) {
      return;
    }

    const nextValue = Math.max(1, Number(currentRow.quantity || 1) - 1);
    updateProductRow(rowId, { quantity: String(nextValue) });
  };

  const addProductRow = () => {
    setProductRows((current) => [...current, createProductRow()]);
  };

  const removeProductRow = (rowId) => {
    if (productRows.length === 1) {
      return;
    }

    setProductRows((current) => current.filter((row) => row.id !== rowId));
  };

  const addPaymentRow = () => {
    setPaymentRows((current) => [...current, createPaymentRow()]);
  };

  const removePaymentRow = (rowId) => {
    if (paymentRows.length === 1) {
      return;
    }

    setPaymentRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handlePaymentMethodChange = async (rowId, methodId) => {
    updatePaymentRow(rowId, {
      methodId,
      currencyId: '',
      currencyLabel: '',
      amount: '',
    });
    await loadCurrencies(methodId);
  };

  const handlePaymentCurrencyChange = (rowId, methodId, currencyId) => {
    const selectedOption = (currencyOptionsByMethod[methodId] || []).find(
      (item) => item.value === currencyId
    );

    updatePaymentRow(rowId, {
      currencyId,
      currencyLabel: selectedOption?.label || '',
    });
  };

  const resetForm = () => {
    setSelectedEventId('');
    setProductRows([createProductRow()]);
    setPaymentRows([createPaymentRow()]);
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
      setDetailError(err?.message || 'No se pudo cargar el detalle.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      const message =
        paymentTotals.remainingUsd > 0.01
          ? 'Completa el desglose de pago hasta cubrir el total de la venta.'
          : 'Completa el evento, los productos y el desglose antes de registrar.';
      Alert.alert('Datos incompletos', message);
      return;
    }

    const payload = {
      selectEvento: Number(selectedEventId),
      productos: normalizedProductRows.map((row) => ({
        id_producto: Number(row.productId),
        cantidad: Number(row.quantity),
        precio_unitario: Number(row.product?.precio || 0),
        subtotal: Number(row.subtotal || 0),
      })),
      desglose: paymentRows.map((row) => ({
        id_metodo_pago: Number(row.methodId),
        id_moneda: Number(row.currencyId),
        monto: Number(row.amount || 0),
      })),
    };

    setSubmitting(true);
    try {
      const response = await registerEventSale(payload, token);
      resetForm();
      await loadScreenData(false);

      Alert.alert(
        'Venta registrada',
        response?.message || 'La venta por evento fue enviada al backend.',
        [
          { text: 'Seguir' },
          {
            text: 'Ver mis pedidos',
            onPress: () => navigation.navigate('Pedidos'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Error al registrar',
        err?.message || 'No se pudo registrar la venta por evento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScreenData(false);
  };

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#14532d" />
        <Text style={styles.centerText}>Cargando ventas por evento...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerScreen}>
        <Ionicons name="cloud-offline-outline" size={46} color="#b91c1c" />
        <Text style={styles.centerTitle}>No pudimos cargar el modulo</Text>
        <Text style={styles.centerText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => loadScreenData()}>
          <Text style={styles.primaryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14532d" />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="radio-outline" size={30} color="#14532d" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Ventas por evento</Text>
            <Text style={styles.heroSubtitle}>
              Registra tus ventas por lote, distribuye el pago y revisa el resumen de {displayName}.
            </Text>
          </View>
        </View>

        <SectionCard
          icon="calendar-outline"
          title="Evento"
          subtitle="Selecciona uno de los eventos activos disponibles en el backend.">
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedEventId}
              onValueChange={setSelectedEventId}
              style={styles.picker}>
              <Picker.Item label="Selecciona un evento" value="" />
              {eventos.map((event) => (
                <Picker.Item key={event.id} label={event.nombre} value={event.id} />
              ))}
            </Picker>
          </View>
          {!eventos.length ? (
            <Text style={styles.inlineHint}>
              No hay eventos activos en este momento para registrar ventas.
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard
          icon="cube-outline"
          title="Productos vendidos"
          subtitle="Agrega los productos del emprendedor y define la cantidad real vendida.">
          {normalizedProductRows.map((row, index) => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.rowCardHeader}>
                <Text style={styles.rowCardTitle}>Producto {index + 1}</Text>
                {productRows.length > 1 ? (
                  <TouchableOpacity onPress={() => removeProductRow(row.id)}>
                    <Ionicons name="trash-outline" size={18} color="#b91c1c" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={row.productId}
                  onValueChange={(value) => handleProductSelect(row.id, value)}
                  style={styles.picker}>
                  <Picker.Item label="Selecciona un producto" value="" />
                  {productos.map((product) => (
                    <Picker.Item
                      key={product.id_producto}
                      label={`${product.nombre} (${product.stock} disponibles)`}
                      value={String(product.id_producto)}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.stockRow}>
                <Text style={styles.stockText}>
                  Precio unitario: {formatUsd(row.product?.precio)}
                </Text>
                <Text style={styles.stockText}>
                  Disponible para esta fila: {row.maxAvailable}
                </Text>
              </View>

              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(row.id)}
                  disabled={!row.product}>
                  <Ionicons name="remove" size={18} color="#14532d" />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  keyboardType="number-pad"
                  value={row.quantity}
                  editable={Boolean(row.product)}
                  onChangeText={(value) => handleQuantityChange(row.id, value)}
                />

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(row.id)}
                  disabled={!row.product}>
                  <Ionicons name="add" size={18} color="#14532d" />
                </TouchableOpacity>
              </View>

              <View style={styles.subtotalPill}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>{formatUsd(row.subtotal)}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.secondaryButton} onPress={addProductRow}>
            <Ionicons name="add-circle-outline" size={18} color="#14532d" />
            <Text style={styles.secondaryButtonText}>Agregar otro producto</Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard
          icon="wallet-outline"
          title="Desglose de pago"
          subtitle="Puedes dividir el monto entre varias monedas y metodos, tal como en el sistema web.">
          {paymentRows.map((row, index) => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.rowCardHeader}>
                <Text style={styles.rowCardTitle}>Pago {index + 1}</Text>
                {paymentRows.length > 1 ? (
                  <TouchableOpacity onPress={() => removePaymentRow(row.id)}>
                    <Ionicons name="trash-outline" size={18} color="#b91c1c" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={row.methodId}
                  onValueChange={(value) => handlePaymentMethodChange(row.id, value)}
                  style={styles.picker}>
                  <Picker.Item label="Selecciona metodo de pago" value="" />
                  {metodosPago.map((method) => (
                    <Picker.Item
                      key={method.id_metodo_pago}
                      label={method.nombre}
                      value={String(method.id_metodo_pago)}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={row.currencyId}
                  enabled={Boolean(row.methodId)}
                  onValueChange={(value) =>
                    handlePaymentCurrencyChange(row.id, row.methodId, value)
                  }
                  style={styles.picker}>
                  <Picker.Item
                    label={
                      loadingCurrencies[row.methodId]
                        ? 'Cargando monedas...'
                        : 'Selecciona moneda'
                    }
                    value=""
                  />
                  {(currencyOptionsByMethod[row.methodId] || []).map((currency) => (
                    <Picker.Item
                      key={currency.value}
                      label={currency.label}
                      value={currency.value}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Monto"
                keyboardType="decimal-pad"
                value={row.amount}
                onChangeText={(value) =>
                  updatePaymentRow(row.id, {
                    amount: value.replace(/[^0-9.,]/g, '').replace(',', '.'),
                  })
                }
              />
            </View>
          ))}

          <TouchableOpacity style={styles.secondaryButton} onPress={addPaymentRow}>
            <Ionicons name="add-circle-outline" size={18} color="#14532d" />
            <Text style={styles.secondaryButtonText}>Agregar otro metodo</Text>
          </TouchableOpacity>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Total venta</Text>
              <Text style={styles.summaryValue}>{formatUsd(totalProductsAmount)}</Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Pagado USD</Text>
              <Text style={styles.summaryValue}>{formatUsd(paymentTotals.totalUsd)}</Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Pagado Bs</Text>
              <Text style={styles.summaryValue}>{formatBs(paymentTotals.totalBs)}</Text>
            </View>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>Faltante USD</Text>
              <Text
                style={[
                  styles.summaryValue,
                  paymentTotals.remainingUsd > 0.01 ? styles.summaryPending : styles.summaryOk,
                ]}>
                {formatUsd(paymentTotals.remainingUsd)}
              </Text>
            </View>
          </View>

          {paymentTotals.totalBs > 0 ? (
            <Text style={styles.inlineHint}>
              Tasa BCV usada: {exchangeRate > 0 ? formatBs(exchangeRate) : 'No disponible'}
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard
          icon="checkmark-done-outline"
          title="Confirmacion"
          subtitle="Cuando el total del desglose cubra la venta, podras registrarla en el backend.">
          <TouchableOpacity
            style={[styles.primaryButton, (!canSubmit || submitting) && styles.buttonDisabled]}
            disabled={!canSubmit || submitting}
            onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Registrando...' : 'Registrar venta por evento'}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        <SectionCard
          icon="receipt-outline"
          title="Ultimas ventas registradas"
          subtitle="Estas ventas tambien quedaran visibles en la seccion Mis pedidos.">
          {ventas.length ? (
            ventas.slice(0, 5).map((sale) => (
              <TouchableOpacity
                key={String(sale.id_evento)}
                style={styles.saleCard}
                onPress={() => openDetail(sale.id_evento)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.saleTitle}>{sale.nombre_evento}</Text>
                  <Text style={styles.saleMeta}>
                    {formatDate(sale.fecha_inicio)} al {formatDate(sale.fecha_fin)}
                  </Text>
                  <Text style={styles.saleMeta}>{sale.direccion}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.saleAmount}>{formatUsd(sale.monto_total)}</Text>
                  <Text style={styles.saleStatus}>{statusLabel(sale.status_evento)}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyInlineBox}>
              <Text style={styles.centerText}>
                Aun no hay ventas por evento registradas para este usuario.
              </Text>
            </View>
          )}
        </SectionCard>
      </ScrollView>

      <SaleDetailModal
        visible={detailVisible}
        detail={detailData}
        loading={detailLoading}
        error={detailError}
        onClose={() => setDetailVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  hero: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 24,
    padding: 18,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  picker: {
    width: '100%',
  },
  inlineHint: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  rowCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fbfdff',
  },
  rowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  stockText: {
    color: '#475569',
    fontSize: 13,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginTop: 12,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    minWidth: 68,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  subtotalPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subtotalLabel: {
    fontSize: 12,
    color: '#166534',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532d',
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#14532d',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 2,
  },
  secondaryButtonText: {
    color: '#14532d',
    fontWeight: '800',
  },
  summaryGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCell: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryPending: {
    color: '#b45309',
  },
  summaryOk: {
    color: '#166534',
  },
  primaryButton: {
    backgroundColor: '#14532d',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  saleCard: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  saleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  saleMeta: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 13,
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532d',
  },
  saleStatus: {
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
  },
  emptyInlineBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  centerBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  centerText: {
    marginTop: 8,
    color: '#64748b',
    lineHeight: 20,
    textAlign: 'center',
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
  detailSectionTitle: {
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
