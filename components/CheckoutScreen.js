import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import useFetch from './../hooks/useFetch';
import { buildApiUrl } from './../config/api';
import { useAuth } from './../context/AuthContext';
import { useCart } from './../context/CartContext';

const deliveryModes = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Envío nacional', value: 'nacional' },
];

const paymentMethods = [
  { label: 'Efectivo', value: '1' },
  { label: 'Transferencia', value: '2' },
  { label: 'Pago móvil', value: '3' },
];

const currencies = [
  { label: 'USD', value: 'USD' },
  { label: 'Bs', value: 'Bs' },
];

const steps = [
  { key: 1, label: 'Carrito' },
  { key: 2, label: 'Entrega' },
  { key: 3, label: 'Pago' },
  { key: 4, label: 'Confirmación' },
];

const CHECKOUT_DRAFT_KEY = 'projumi_checkout_draft_v1';
const EMPRESAS_ENVIO_PATH = '/empresa/getAllEmpresasEnvio';
const PEDIDOS_REGISTRAR_PATH = '/pedidos/registrar';

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const getDisplayName = (user) => {
  if (!user) {
    return 'Usuario';
  }

  const fullName = [user.name || user.nombre, user.apellido]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || user.fullName || user.nombreCompleto || 'Usuario';
};

const readJsonSafely = async (response) => {
  const text = await response.text();
  const normalized = text.replace(/^\uFEFF/, '').trim();

  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch {
    return { message: normalized };
  }
};

const Card = ({ title, children, subtitle }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    {children}
  </View>
);

export default function CheckoutScreen({ navigation }) {
  const { user, token } = useAuth();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [draftReady, setDraftReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    deliveryMode: '',
    direccionExacta: '',
    empresaEnvio: '',
    direccionEnvio: '',
    metodoPago: '2',
    moneda: 'USD',
    referencia: '',
    comprobante: '',
    observacion: '',
  });

  const userDisplayName = useMemo(() => getDisplayName(user), [user]);
  const subtotal = total;
  const envio = 0;
  const totalFinal = subtotal + envio;

  const { data: empresasResponse, loading: empresasLoading, error: empresasError } =
    useFetch(buildApiUrl(EMPRESAS_ENVIO_PATH));

  const empresasEnvio = useMemo(() => {
    if (Array.isArray(empresasResponse?.data)) {
      return empresasResponse.data;
    }

    if (Array.isArray(empresasResponse)) {
      return empresasResponse;
    }

    return [];
  }, [empresasResponse]);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const storedDraft = await AsyncStorage.getItem(CHECKOUT_DRAFT_KEY);
        if (!storedDraft) {
          return;
        }

        const parsedDraft = JSON.parse(storedDraft);
        if (parsedDraft?.form && typeof parsedDraft.form === 'object') {
          setForm((current) => ({ ...current, ...parsedDraft.form }));
        }

        if (typeof parsedDraft?.step === 'number' && parsedDraft.step >= 1) {
          setStep(Math.min(parsedDraft.step, 4));
        }
      } catch (error) {
        console.log('No se pudo restaurar el borrador del checkout:', error?.message);
      } finally {
        setDraftReady(true);
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem(
          CHECKOUT_DRAFT_KEY,
          JSON.stringify({
            step,
            form,
          })
        );
      } catch (error) {
        console.log('No se pudo guardar el borrador del checkout:', error?.message);
      }
    };

    saveDraft();
  }, [draftReady, form, step]);

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(CHECKOUT_DRAFT_KEY);
    } catch (error) {
      console.log('No se pudo borrar el borrador del checkout:', error?.message);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const canGoNextFromStep = () => {
    if (step === 1) {
      return items.length > 0;
    }

    if (step === 2) {
      if (!form.deliveryMode) {
        return false;
      }

      if (form.deliveryMode === 'delivery') {
        return Boolean(form.direccionExacta.trim());
      }

      return Boolean(form.empresaEnvio.trim() && form.direccionEnvio.trim());
    }

    if (step === 3) {
      return Boolean(form.metodoPago && form.moneda);
    }

    return true;
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }

    navigation.goBack();
  };

  const buildCheckoutPayload = () => {
    const detallePedido = {
      detalle: items.map((item) => ({
        id: Number(item.id_producto || item.id),
        id_producto: Number(item.id_producto || item.id),
        cantidad: Number(item.quantity || 1),
        precio: Number(item.precio || 0),
        precio_unitario: Number(item.precio || 0),
      })),
    };

    const detallePago = {
      detalles: [
        {
          fk_detalle_metodo_pago: Number(form.metodoPago),
          monto: Number(totalFinal),
          referencia: form.referencia.trim() || `APP-${Date.now()}`,
          comprobante: form.comprobante.trim(),
        },
      ],
    };

    const detalleEnvio =
      form.deliveryMode === 'delivery'
        ? {
            modoEntrega: 'delivery',
            destinatario: userDisplayName,
            telefono_destinatario: user?.telefono || '',
            direccion_exacta: form.direccionExacta.trim(),
            observacion: form.observacion.trim(),
          }
        : {
            modoEntrega: 'envio nacional',
            empresaEnvio: Number(form.empresaEnvio),
            direccionEnvio: form.direccionEnvio.trim(),
          };

    return {
      cedula: user?.cedula || '',
      detallePedido,
      detallePago,
      detalleEnvio,
    };
  };

  const handleConfirmPurchase = async () => {
    if (!token) {
      Alert.alert('Sesion requerida', 'Inicia sesion nuevamente para confirmar la compra.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Carrito vacio', 'Agrega productos antes de confirmar.');
      return;
    }

    if (!canGoNextFromStep()) {
      Alert.alert('Faltan datos', 'Completa los campos requeridos antes de confirmar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(PEDIDOS_REGISTRAR_PATH), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const payload = await readJsonSafely(response);

      if (!response.ok || payload?.success === false) {
        throw new Error(
          payload?.message || payload?.error || `No se pudo registrar la compra (HTTP ${response.status})`
        );
      }

      Alert.alert(
        'Compra registrada',
        payload?.message || 'Tu pedido fue enviado al backend correctamente.'
      );
      clearCart();
      await clearDraft();
      navigation.navigate('CompraExitosa', {
        pedidoId: payload?.pedido_id || payload?.pedido?.id_pedidos || null,
        total: totalFinal,
        metodoPago:
          paymentMethods.find((item) => item.value === form.metodoPago)?.label ||
          'No definido',
        deliveryMode: form.deliveryMode,
        empresaEnvio:
          empresasEnvio.find(
            (empresa) => empresa.id_empresa_envio?.toString() === form.empresaEnvio
          )?.nombre || null,
      });
    } catch (error) {
      console.log('Error al registrar compra:', error);
      Alert.alert('Error', error?.message || 'No se pudo registrar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !items.length) {
      Alert.alert('Carrito vacio', 'Agrega productos antes de continuar.');
      return;
    }

    if (step === 2 && !canGoNextFromStep()) {
      Alert.alert('Faltan datos', 'Completa los campos de entrega.');
      return;
    }

    if (step === 3 && !canGoNextFromStep()) {
      Alert.alert('Faltan datos', 'Selecciona el metodo de pago y la moneda.');
      return;
    }

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    handleConfirmPurchase();
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartRow}>
      <View style={styles.cartRowTop}>
        <Text style={styles.cartName} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.cartPrice}>{formatPrice(item.precio)}</Text>
      </View>
      <View style={styles.cartMetaRow}>
        <Text style={styles.cartMeta}>Cantidad: {item.quantity}</Text>
        <Text style={styles.cartMeta}>
          Subtotal: {formatPrice(item.precio * item.quantity)}
        </Text>
      </View>
    </View>
  );

  const renderProgress = () => (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Proceso de compra</Text>
        <View style={styles.progressPill}>
          <Ionicons name="cart" size={15} color="#14532d" />
          <Text style={styles.progressPillText}>{items.length} productos</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
      </View>

      <View style={styles.stepRow}>
        {steps.map((item) => {
          const isActive = item.key === step;
          const isDone = item.key < step;

          return (
            <View key={item.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isDone && styles.stepCircleDone,
                ]}>
                <Text style={styles.stepCircleText}>{item.key}</Text>
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {renderProgress()}

      {step === 1 && (
        <Card title="Mi carrito" subtitle="Estos son los productos que has agregado.">
          {items.length ? (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCartItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
              <Text style={styles.emptyText}>
                Ve al catalogo para agregar articulos y luego continua con la compra.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Productos')}>
                <Text style={styles.emptyButtonText}>Ir a productos</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.summaryBox}>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>{formatPrice(envio)}</Text>
            </View>
            <View style={[styles.summaryLine, styles.summaryTotalLine]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>{formatPrice(totalFinal)}</Text>
            </View>
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card
          title="Modo de entrega"
          subtitle="Los datos de la factura pertenecen al usuario autenticado.">
          <View style={styles.userBox}>
            <Text style={styles.userBoxTitle}>Datos del usuario</Text>
            <Text style={styles.userBoxText}>Nombre: {userDisplayName}</Text>
            <Text style={styles.userBoxText}>Cedula: {user?.cedula || 'No disponible'}</Text>
            <Text style={styles.userBoxText}>
              Correo: {user?.correo || user?.email || 'No disponible'}
            </Text>
          </View>

          <View style={styles.optionGroup}>
            {deliveryModes.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  form.deliveryMode === option.value && styles.optionSelected,
                ]}
                onPress={() => updateForm('deliveryMode', option.value)}>
                <Text
                  style={[
                    styles.optionText,
                    form.deliveryMode === option.value && styles.optionTextSelected,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {form.deliveryMode === 'delivery' && (
            <View style={styles.formBox}>
              <Text style={styles.label}>Direccion exacta</Text>
              <TextInput
                style={styles.input}
                value={form.direccionExacta}
                onChangeText={(value) => updateForm('direccionExacta', value)}
                placeholder="Escribe la direccion de entrega"
              />
              <Text style={styles.label}>Observacion</Text>
              <TextInput
                style={styles.input}
                value={form.observacion}
                onChangeText={(value) => updateForm('observacion', value)}
                placeholder="Punto de referencia"
              />
            </View>
          )}

          {form.deliveryMode === 'nacional' && (
            <View style={styles.formBox}>
              <Text style={styles.label}>Empresa de envio</Text>
              {empresasLoading ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator size="small" color="#14532d" />
                  <Text style={styles.helperText}>Cargando empresas...</Text>
                </View>
              ) : empresasError ? (
                <Text style={styles.errorText}>
                  No se pudieron cargar las empresas de envio.
                </Text>
              ) : (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={form.empresaEnvio}
                    onValueChange={(value) => updateForm('empresaEnvio', value)}>
                    <Picker.Item label="Selecciona una empresa..." value="" />
                    {empresasEnvio.map((empresa) => (
                      <Picker.Item
                        key={empresa.id_empresa_envio?.toString()}
                        label={empresa.nombre}
                        value={empresa.id_empresa_envio?.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              <Text style={styles.label}>Direccion de entrega</Text>
              <TextInput
                style={styles.input}
                value={form.direccionEnvio}
                onChangeText={(value) => updateForm('direccionEnvio', value)}
                placeholder="Direccion de entrega"
              />
            </View>
          )}
        </Card>
      )}

      {step === 3 && (
        <Card title="Metodo de pago" subtitle="Selecciona como vas a pagar tu pedido.">
          <View style={styles.labelRow}>
            <Text style={styles.label}>Metodo de pago</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.metodoPago}
              onValueChange={(value) => updateForm('metodoPago', value)}>
              {paymentMethods.map((method) => (
                <Picker.Item key={method.value} label={method.label} value={method.value} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Moneda</Text>
          <View style={styles.chipRow}>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.value}
                style={[
                  styles.chip,
                  form.moneda === currency.value && styles.chipSelected,
                ]}
                onPress={() => updateForm('moneda', currency.value)}>
                <Text
                  style={[
                    styles.chipText,
                    form.moneda === currency.value && styles.chipTextSelected,
                  ]}>
                  {currency.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formBox}>
            <Text style={styles.label}>Referencia</Text>
            <TextInput
              style={styles.input}
              value={form.referencia}
              onChangeText={(value) => updateForm('referencia', value)}
              placeholder="Referencia del pago"
            />

            <Text style={styles.label}>Comprobante</Text>
            <TextInput
              style={styles.input}
              value={form.comprobante}
              onChangeText={(value) => updateForm('comprobante', value)}
              placeholder="Codigo del comprobante"
            />
          </View>
        </Card>
      )}

      {step === 4 && (
        <Card title="Confirmacion" subtitle="Revisa los datos antes de continuar.">
          <View style={styles.resumeBanner}>
            <Ionicons name="receipt-outline" size={22} color="#14532d" />
            <View style={styles.resumeBannerText}>
              <Text style={styles.resumeBannerTitle}>Resumen final</Text>
              <Text style={styles.resumeBannerSubtitle}>
                Verifica productos, entrega y pago antes de confirmar.
              </Text>
            </View>
          </View>

          <View style={styles.resumeList}>
            {items.map((item) => (
              <View key={item.id} style={styles.resumeItem}>
                <Text style={styles.resumeItemName} numberOfLines={2}>
                  {item.nombre}
                </Text>
                <Text style={styles.resumeItemMeta}>
                  x{item.quantity} {formatPrice(item.precio * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.userBox}>
            <Text style={styles.userBoxTitle}>Factura</Text>
            <Text style={styles.userBoxText}>Nombre: {userDisplayName}</Text>
            <Text style={styles.userBoxText}>Cedula: {user?.cedula || 'No disponible'}</Text>
            <Text style={styles.userBoxText}>
              Correo: {user?.correo || user?.email || 'No disponible'}
            </Text>
          </View>

          <View style={styles.userBox}>
            <Text style={styles.userBoxTitle}>Entrega</Text>
            <Text style={styles.userBoxText}>
              Modo: {form.deliveryMode === 'delivery' ? 'Delivery' : 'Envío nacional'}
            </Text>
            <Text style={styles.userBoxText}>
              Detalle:{' '}
              {form.deliveryMode === 'delivery'
                ? form.direccionExacta || 'Sin direccion'
                : form.direccionEnvio || 'Sin direccion'}
            </Text>
            {form.deliveryMode === 'nacional' ? (
              <Text style={styles.userBoxText}>
                Empresa:{' '}
                {empresasEnvio.find(
                  (empresa) => empresa.id_empresa_envio?.toString() === form.empresaEnvio
                )?.nombre || 'No definida'}
              </Text>
            ) : null}
          </View>

          <View style={styles.userBox}>
            <Text style={styles.userBoxTitle}>Pago</Text>
            <Text style={styles.userBoxText}>
              Metodo:{' '}
              {paymentMethods.find((item) => item.value === form.metodoPago)?.label ||
                'No definido'}
            </Text>
            <Text style={styles.userBoxText}>Moneda: {form.moneda}</Text>
            <Text style={styles.userBoxText}>
              Referencia: {form.referencia || 'Sin referencia'}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>{formatPrice(envio)}</Text>
            </View>
            <View style={[styles.summaryLine, styles.summaryTotalLine]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>{formatPrice(totalFinal)}</Text>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>{step > 1 ? 'Atrás' : 'Volver'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isSubmitting}>
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Procesando...' : step === 4 ? 'Confirmar compra' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  resumeBannerText: {
    flex: 1,
  },
  resumeBannerTitle: {
    color: '#14532d',
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 2,
  },
  resumeBannerSubtitle: {
    color: '#4b5563',
    fontSize: 12,
    lineHeight: 18,
  },
  resumeList: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  resumeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resumeItemName: {
    flex: 1,
    color: '#111827',
    fontWeight: '700',
    fontSize: 13,
  },
  resumeItemMeta: {
    color: '#14532d',
    fontWeight: '800',
    fontSize: 12,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  progressPillText: {
    color: '#14532d',
    fontWeight: '800',
    fontSize: 12,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#14532d',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#14532d',
  },
  stepCircleDone: {
    backgroundColor: '#16a34a',
  },
  stepCircleText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  stepLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#14532d',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#14532d',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  cartRow: {
    paddingVertical: 12,
  },
  cartRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  cartName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cartPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#14532d',
  },
  cartMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cartMeta: {
    fontSize: 13,
    color: '#6b7280',
  },
  summaryBox: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  summaryTotalLine: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#14532d',
  },
  userBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  userBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#14532d',
    marginBottom: 8,
  },
  userBoxText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  optionGroup: {
    gap: 10,
    marginBottom: 12,
  },
  option: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    backgroundColor: '#14532d',
    borderColor: '#14532d',
  },
  optionText: {
    color: '#334155',
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#fff',
  },
  formBox: {
    marginTop: 4,
  },
  labelRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#111827',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#14532d',
  },
  chipText: {
    color: '#334155',
    fontWeight: '800',
  },
  chipTextSelected: {
    color: '#14532d',
  },
  loaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  helperText: {
    color: '#6b7280',
    fontSize: 13,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontWeight: '800',
  },
  nextButton: {
    flex: 1.3,
    backgroundColor: '#14532d',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.75,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
});
