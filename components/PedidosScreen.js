import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const pedidos = [
  {
    id: 'PED-27',
    fecha: '2025-10-27 14:18:52',
    cliente: 'Edgar',
    emprendedor: 'Rosmery',
    total: '$45.00',
    estado: 'Aprobado',
  },
  {
    id: 'PED-28',
    fecha: '2025-10-28 09:12:30',
    cliente: 'Luis',
    emprendedor: 'María',
    total: '$30.00',
    estado: 'Pendiente',
  },
  {
    id: 'PED-29',
    fecha: '2025-10-28 10:05:42',
    cliente: 'Ana',
    emprendedor: 'Carlos',
    total: '$60.00',
    estado: 'Aprobado',
  },
  {
    id: 'PED-30',
    fecha: '2025-10-29 13:25:11',
    cliente: 'Carmen',
    emprendedor: 'Daniela',
    total: '$22.50',
    estado: 'Cancelado',
  },
  {
    id: 'PED-31',
    fecha: '2025-10-29 16:49:06',
    cliente: 'Pedro',
    emprendedor: 'Miguel',
    total: '$78.90',
    estado: 'Aprobado',
  },
  {
    id: 'PED-32',
    fecha: '2025-10-30 11:14:59',
    cliente: 'Josefina',
    emprendedor: 'Lucía',
    total: '$15.00',
    estado: 'Pendiente',
  },
  {
    id: 'PED-33',
    fecha: '2025-10-30 18:22:17',
    cliente: 'Raúl',
    emprendedor: 'Esteban',
    total: '$120.00',
    estado: 'Aprobado',
  },
  {
    id: 'PED-34',
    fecha: '2025-10-31 08:01:33',
    cliente: 'Patricia',
    emprendedor: 'Isabella',
    total: '$55.40',
    estado: 'En envío',
  },
  {
    id: 'PED-35',
    fecha: '2025-10-31 12:47:21',
    cliente: 'Mateo',
    emprendedor: 'Roberto',
    total: '$92.30',
    estado: 'Aprobado',
  },
  {
    id: 'PED-36',
    fecha: '2025-11-01 15:33:09',
    cliente: 'Melissa',
    emprendedor: 'Fernanda',
    total: '$38.80',
    estado: 'Pendiente',
  },
];

const PedidosScreen = ({ navigation }) => {
  return (
    <FlatList
      data={pedidos}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>Pedidos</Text>}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: Platform.OS === 'android' ? 60 : 20,
        flexGrow: 1,
      }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.row}> Pedido: {item.id}</Text>
          <Text style={styles.row}> Fecha: {item.fecha}</Text>
          <Text style={styles.row}> Cliente: {item.cliente}</Text>
          <Text style={styles.row}> Emprendedor: {item.emprendedor}</Text>
          <Text style={styles.row}> Total: {item.total}</Text>
          <Text style={[styles.row, styles.estado]}>{item.estado}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
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
  row: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  estado: {
    fontWeight: 'bold',
    color: '#006400',
  },
});

export default PedidosScreen;
