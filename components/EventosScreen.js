import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import useFetch from './../hooks/useFetch';

const API_URL =
  'https://crudcrud.com/api/26115b9e9e96401ba05b0cabe8134c12/evento';

const VentasEventos = () => {
  const { data: ventas, loading, error, refetch } = useFetch(API_URL);

  const [nuevaVenta, setNuevaVenta] = useState({
    evento: '',
    producto: '',
    cantidad: '',
    metodo: '',
    moneda: '',
    monto: '',
  });

  const [agregando, setAgregando] = useState(false);

  const metodosPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' },
  ];

  const monedas = [
    { label: 'Dólares ($)', value: 'USD' },
    { label: 'Bolívares (Bs)', value: 'VES' },
    { label: 'Euros (€)', value: 'EUR' },
  ];

  const registrarVenta = async () => {
    if (
      !nuevaVenta.evento ||
      !nuevaVenta.producto ||
      !nuevaVenta.cantidad ||
      !nuevaVenta.metodo ||
      !nuevaVenta.moneda ||
      !nuevaVenta.monto
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setAgregando(true);
    try {
      const ventaData = {
        ...nuevaVenta,
        cantidad: parseInt(nuevaVenta.cantidad),
        monto: parseFloat(nuevaVenta.monto),
        fecha: new Date().toISOString(),
        total: parseInt(nuevaVenta.cantidad) * parseFloat(nuevaVenta.monto),
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaData),
      });

      if (response.ok) {
        setNuevaVenta({
          evento: '',
          producto: '',
          cantidad: '',
          metodo: '',
          moneda: '',
          monto: '',
        });
        Alert.alert('Éxito', 'Venta registrada correctamente');
        refetch();
      } else {
        throw new Error('Error al registrar la venta');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo registrar la venta');
      console.error(err);
    } finally {
      setAgregando(false);
    }
  };

  const eliminarVenta = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Venta eliminada');
        refetch();
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar la venta');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando ventas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error al cargar las ventas</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.titulo}> Ventas por Eventos</Text>

        <View style={styles.formulario}>
          <Text style={styles.subtitulo}>Registrar Nueva Venta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre del Evento"
            value={nuevaVenta.evento}
            onChangeText={(text) =>
              setNuevaVenta({ ...nuevaVenta, evento: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Producto Vendido"
            value={nuevaVenta.producto}
            onChangeText={(text) =>
              setNuevaVenta({ ...nuevaVenta, producto: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Cantidad"
            value={nuevaVenta.cantidad}
            onChangeText={(text) =>
              setNuevaVenta({ ...nuevaVenta, cantidad: text })
            }
            keyboardType="numeric"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Método de Pago:</Text>
            <Picker
              selectedValue={nuevaVenta.metodo}
              onValueChange={(value) =>
                setNuevaVenta({ ...nuevaVenta, metodo: value })
              }
              style={styles.picker}>
              <Picker.Item label="Selecciona método" value="" />
              {metodosPago.map((metodo) => (
                <Picker.Item
                  key={metodo.value}
                  label={metodo.label}
                  value={metodo.value}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Moneda:</Text>
            <Picker
              selectedValue={nuevaVenta.moneda}
              onValueChange={(value) =>
                setNuevaVenta({ ...nuevaVenta, moneda: value })
              }
              style={styles.picker}>
              <Picker.Item label="Selecciona moneda" value="" />
              {monedas.map((moneda) => (
                <Picker.Item
                  key={moneda.value}
                  label={moneda.label}
                  value={moneda.value}
                />
              ))}
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Monto"
            value={nuevaVenta.monto}
            onChangeText={(text) =>
              setNuevaVenta({ ...nuevaVenta, monto: text })
            }
            keyboardType="numeric"
          />

          {nuevaVenta.cantidad && nuevaVenta.monto && (
            <View style={styles.resumen}>
              <Text style={styles.resumenTexto}>
                Total: {nuevaVenta.cantidad} x ${nuevaVenta.monto} =
                <Text style={styles.total}>
                  {' '}
                  ${(nuevaVenta.cantidad * nuevaVenta.monto).toFixed(2)}
                </Text>
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.boton, agregando && styles.botonDeshabilitado]}
            onPress={registrarVenta}
            disabled={agregando}>
            <Text style={styles.botonTexto}>
              {agregando ? 'Registrando...' : 'Registrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitulo}>Vendidos</Text>

        <View style={styles.lista}>
          {ventas && ventas.length > 0 ? (
            ventas.map((venta) => (
              <View key={venta._id} style={styles.itemVenta}>
                <View style={styles.infoVenta}>
                  <Text style={styles.evento}>{venta.evento}</Text>
                  <Text style={styles.producto}>{venta.producto}</Text>
                  <Text style={styles.detalles}>
                    {venta.cantidad} x ${venta.monto} {venta.moneda}(
                    {venta.metodo})
                  </Text>
                  <Text style={styles.total}>
                    Total: ${venta.total?.toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => eliminarVenta(venta._id)}>
                  <Text style={styles.botonEliminarTexto}></Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.vacio}>
              <Text style={styles.textoVacio}>No hay ventas registradas</Text>
              <Text style={styles.textoVacioSecundario}>
                Registra la primera venta arriba
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#2c3e50',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#34495e',
  },
  formulario: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  resumen: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  resumenTexto: {
    fontSize: 16,
    color: '#2c3e50',
  },
  total: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  boton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#95a5a6',
  },
  botonTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lista: {
    marginBottom: 20,
  },
  itemVenta: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoVenta: {
    flex: 1,
  },
  evento: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  producto: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  detalles: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  botonEliminar: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  botonEliminarTexto: {
    color: 'white',
    fontSize: 16,
  },
  vacio: {
    alignItems: 'center',
    padding: 40,
  },
  textoVacio: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  textoVacioSecundario: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VentasEventos;
