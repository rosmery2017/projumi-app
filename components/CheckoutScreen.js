import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function CheckoutScreen({ navigation }) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    envio: '',
    destinatario: '',
    telefono: '',
    correo: '',
    direccionExacta: '',
    empresaEnvio: '',
    direccionEntrega: '',
    metodoPago: '',
    moneda: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else alert('Pedido registrado. ¡Gracias por tu compra!');
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Proceso de Compra</Text>

      {/* PASO 1: Selección de envío */}
      {step === 1 && (
        <View>
          <Text style={styles.subtitle}>Método de Envío</Text>

          <TouchableOpacity
            style={[
              styles.option,
              form.envio === 'delivery' && styles.selected,
            ]}
            onPress={() => setForm({ ...form, envio: 'delivery' })}>
            <Text style={styles.optionText}>Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              form.envio === 'nacional' && styles.selected,
            ]}
            onPress={() => setForm({ ...form, envio: 'nacional' })}>
            <Text style={styles.optionText}>Envío Nacional</Text>
          </TouchableOpacity>

          {/* FORM DELIVERY */}
          {form.envio === 'delivery' && (
            <View style={styles.formBox}>
              <TextInput
                placeholder="Destinatario"
                style={styles.input}
                value={form.destinatario}
                onChangeText={(t) => setForm({ ...form, destinatario: t })}
              />
              <TextInput
                placeholder="Teléfono destinatario"
                style={styles.input}
                keyboardType="phone-pad"
                value={form.telefono}
                onChangeText={(t) => setForm({ ...form, telefono: t })}
              />
              <TextInput
                placeholder="Correo destinatario"
                style={styles.input}
                value={form.correo}
                onChangeText={(t) => setForm({ ...form, correo: t })}
              />
              <TextInput
                placeholder="Dirección exacta"
                style={styles.input}
                value={form.direccionExacta}
                onChangeText={(t) => setForm({ ...form, direccionExacta: t })}
              />
            </View>
          )}

          {/* FORM ENVÍO NACIONAL */}
          {form.envio === 'nacional' && (
            <View style={styles.formBox}>
              <TextInput
                placeholder="Empresa de Envío"
                style={styles.input}
                value={form.empresaEnvio}
                onChangeText={(t) => setForm({ ...form, empresaEnvio: t })}
              />
              <TextInput
                placeholder="Dirección de entrega"
                style={styles.input}
                value={form.direccionEntrega}
                onChangeText={(t) => setForm({ ...form, direccionEntrega: t })}
              />
            </View>
          )}
        </View>
      )}

      {/* PASO 2: Método de pago */}
      {step === 2 && (
        <View>
          <Text style={styles.subtitle}>Método de Pago</Text>

          <TouchableOpacity
            style={[
              styles.option,
              form.metodoPago === 'transferencia' && styles.selected,
            ]}
            onPress={() => setForm({ ...form, metodoPago: 'transferencia' })}>
            <Text style={styles.optionText}>Transferencia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              form.metodoPago === 'pago movil' && styles.selected,
            ]}
            onPress={() => setForm({ ...form, metodoPago: 'pago movil' })}>
            <Text style={styles.optionText}>Pago Móvil</Text>
          </TouchableOpacity>

          {/* Selección de moneda */}
          <Text style={[styles.subtitle, { marginTop: 20 }]}>Moneda</Text>
          <TouchableOpacity
            style={[styles.option, form.moneda === 'USD' && styles.selected]}
            onPress={() => setForm({ ...form, moneda: 'USD' })}>
            <Text style={styles.optionText}>USD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, form.moneda === 'Bs' && styles.selected]}
            onPress={() => setForm({ ...form, moneda: 'Bs' })}>
            <Text style={styles.optionText}>Bolívares (Bs)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PASO 3: Confirmación */}
      {step === 3 && (
        <View>
          <Text style={styles.subtitle}>Confirmación</Text>
          <Text>Envío: {form.envio}</Text>
          <Text>Pago: {form.metodoPago}</Text>
          <Text>Moneda: {form.moneda}</Text>
        </View>
      )}

      {/* Botones */}
      <View style={styles.row}>
        {step > 1 && (
          <TouchableOpacity style={styles.btnBack} onPress={handleBack}>
            <Text style={styles.btnText}>Atrás</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnNext} onPress={handleNext}>
          <Text style={styles.btnText}>
            {step === 3 ? 'Confirmar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  option: {
    padding: 14,
    backgroundColor: '#ececec',
    borderRadius: 8,
    marginBottom: 10,
  },
  optionText: { fontSize: 16 },
  selected: { backgroundColor: '#14532d', borderWidth: 1, borderColor: '#0f3' },
  formBox: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnNext: {
    flex: 1,
    backgroundColor: '#14532d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnBack: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
