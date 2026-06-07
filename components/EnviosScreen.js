import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EnviosScreen = ({ navigation }) => {
  const [tipoEnvioSeleccionado, setTipoEnvioSeleccionado] = useState('Todos');
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const envios = [
    {
      id: '1',
      tipo: 'Nacional',
      empresa: 'Servientrega',
      destino: 'Bogotá - Medellín',
      tiempo: '2-3 días',
      precio: '$15.000',
      estado: 'Activo',
      descripcion: 'Envío nacional express con seguimiento en tiempo real',
      contacto: '3001234567',
    },
    {
      id: '2',
      tipo: 'Delivery',
      empresa: 'Rappi',
      destino: 'Local - 5km radio',
      tiempo: '30-45 min',
      precio: '$8.000',
      estado: 'Activo',
      descripcion: 'Delivery rápido para pedidos locales con entrega inmediata',
      contacto: 'Rappi App',
    },
    {
      id: '3',
      tipo: 'Nacional',
      empresa: 'Coordinadora',
      destino: 'Cali - Barranquilla',
      tiempo: '3-4 días',
      precio: '$18.000',
      estado: 'Activo',
      descripcion: 'Servicio de carga con cobertura nacional',
      contacto: '3007654321',
    },
    {
      id: '4',
      tipo: 'Delivery',
      empresa: 'Domicilios.com',
      destino: 'Local - 3km radio',
      tiempo: '20-35 min',
      precio: '$6.000',
      estado: 'Activo',
      descripcion: 'Servicio de mensajería local para entregas urgentes',
      contacto: '6012345678',
    },
    {
      id: '5',
      tipo: 'Nacional',
      empresa: 'Envía',
      destino: 'Todo Colombia',
      tiempo: '4-5 días',
      precio: '$12.000',
      estado: 'Activo',
      descripcion: 'Envío económico para paquetes de todo el país',
      contacto: '3009876543',
    },
    {
      id: '6',
      tipo: 'Delivery',
      empresa: 'PedidosYa',
      destino: 'Local - 7km radio',
      tiempo: '40-60 min',
      precio: '$9.000',
      estado: 'Activo',
      descripcion: 'Delivery premium con seguimiento GPS',
      contacto: 'PedidosYa App',
    },
  ];

  const tiposEnvio = ['Todos', 'Nacional', 'Delivery'];

  const enviosFiltrados =
    tipoEnvioSeleccionado === 'Todos'
      ? envios
      : envios.filter((envio) => envio.tipo === tipoEnvioSeleccionado);

  const verMasEnvio = (envio) => {
    setEnvioSeleccionado(envio);
    setModalVisible(true);
  };

  const getColorTipo = (tipo) => {
    return tipo === 'Nacional' ? '#007AFF' : '#34C759';
  };

  const renderEnvio = ({ item }) => (
    <ScrollView style={styles.card}>
      <View style={styles.headerCard}>
        <Text style={styles.empresa}>{item.empresa}</Text>
        <View
          style={[
            styles.badgeTipo,
            { backgroundColor: getColorTipo(item.tipo) },
          ]}>
          <Text style={styles.textoBadge}>{item.tipo}</Text>
        </View>
      </View>

      <Text style={styles.destino}> {item.destino}</Text>
      <Text style={styles.tiempo}>{item.tiempo}</Text>
      <Text style={styles.precio}>{item.precio}</Text>

      <View style={styles.footerCard}>
        <Text style={styles.estado}>{item.estado}</Text>
        <TouchableOpacity
          style={styles.botonVerMas}
          onPress={() => verMasEnvio(item)}>
          <Text style={styles.textoBoton}>Ver más</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Envíos Disponibles</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtroContainer}>
        {tiposEnvio.map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.botonTipo,
              tipoEnvioSeleccionado === tipo && styles.botonTipoSeleccionado,
            ]}
            onPress={() => setTipoEnvioSeleccionado(tipo)}>
            <Text
              style={[
                styles.textoTipo,
                tipoEnvioSeleccionado === tipo && styles.textoTipoSeleccionado,
              ]}>
              {tipo === 'Todos'
                ? ' Todos'
                : tipo === 'Nacional'
                ? '🇨🇴 Nacional'
                : ' Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.contador}>
        {enviosFiltrados.length} envío{enviosFiltrados.length !== 1 ? 's' : ''}{' '}
        disponible{enviosFiltrados.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={enviosFiltrados}
        renderItem={renderEnvio}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {envioSeleccionado && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitulo}>
                    {envioSeleccionado.empresa}
                  </Text>
                  <View
                    style={[
                      styles.badgeTipoModal,
                      { backgroundColor: getColorTipo(envioSeleccionado.tipo) },
                    ]}>
                    <Text style={styles.textoBadge}>
                      {envioSeleccionado.tipo}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>Destino:</Text>
                  <Text style={styles.modalText}>
                    {envioSeleccionado.destino}
                  </Text>

                  <Text style={styles.modalLabel}> Tiempo estimado:</Text>
                  <Text style={styles.modalText}>
                    {envioSeleccionado.tiempo}
                  </Text>

                  <Text style={styles.modalLabel}>Precio:</Text>
                  <Text style={styles.modalPrecio}>
                    {envioSeleccionado.precio}
                  </Text>

                  <Text style={styles.modalLabel}> Descripción:</Text>
                  <Text style={styles.modalText}>
                    {envioSeleccionado.descripcion}
                  </Text>

                  <Text style={styles.modalLabel}> Contacto:</Text>
                  <Text style={styles.modalText}>
                    {envioSeleccionado.contacto}
                  </Text>

                  <Text style={styles.modalLabel}> Estado:</Text>
                  <Text style={styles.modalText}>
                    {envioSeleccionado.estado}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonCerrar}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#006400',
  },
  estado: {
    fontWeight: 'bold',
    color: '#006400',
  },

  filtroContainer: {
    paddingHorizontal: 10,
    marginBottom: 15,
    maxHeight: 50,
  },
  botonTipo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botonTipoSeleccionado: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  textoTipo: {
    fontSize: 14,
    color: '#333',
  },
  textoTipoSeleccionado: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contador: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
    fontSize: 14,
  },
  lista: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  empresa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badgeTipo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTipoModal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  textoBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  destino: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tiempo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  footerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  botonVerMas: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalInfo: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 2,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  botonCerrar: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnviosScreen;
