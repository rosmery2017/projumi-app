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
import { Ionicons } from '@expo/vector-icons';

const pagos = [
  {
    id: 'PAY-01',
    fecha: '2025-10-27 14:20:01',
    cliente: 'Edgar',
    emprendedor: 'Rosmery',
    total: '$45.00',
    estado: 'Aprobado',
  },
  {
    id: 'PAY-02',
    fecha: '2025-10-28 09:15:12',
    cliente: 'Luis',
    emprendedor: 'María',
    total: '$30.00',
    estado: 'Pendiente',
  },
  {
    id: 'PAY-03',
    fecha: '2025-10-28 10:08:49',
    cliente: 'Ana',
    emprendedor: 'Carlos',
    total: '$60.00',
    estado: 'Aprobado',
  },
  {
    id: 'PAY-04',
    fecha: '2025-10-29 13:29:50',
    cliente: 'Carmen',
    emprendedor: 'Daniela',
    total: '$22.50',
    estado: 'Rechazado',
  },
  {
    id: 'PAY-05',
    fecha: '2025-10-29 16:51:44',
    cliente: 'Pedro',
    emprendedor: 'Miguel',
    total: '$78.90',
    estado: 'Aprobado',
  },
  {
    id: 'PAY-06',
    fecha: '2025-10-30 11:18:03',
    cliente: 'Josefina',
    emprendedor: 'Lucía',
    total: '$15.00',
    estado: 'Pendiente',
  },
  {
    id: 'PAY-07',
    fecha: '2025-10-30 18:25:55',
    cliente: 'Raúl',
    emprendedor: 'Esteban',
    total: '$120.00',
    estado: 'Aprobado',
  },
  {
    id: 'PAY-08',
    fecha: '2025-10-31 08:03:41',
    cliente: 'Patricia',
    emprendedor: 'Isabella',
    total: '$55.40',
    estado: 'En revisión',
  },
  {
    id: 'PAY-09',
    fecha: '2025-10-31 12:50:12',
    cliente: 'Mateo',
    emprendedor: 'Roberto',
    total: '$92.30',
    estado: 'Aprobado',
  },
  {
    id: 'PAY-10',
    fecha: '2025-11-01 15:35:44',
    cliente: 'Melissa',
    emprendedor: 'Fernanda',
    total: '$38.80',
    estado: 'Pendiente',
  },
];

const PagosScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mis Pagos</Text>

      <FlatList
        data={pagos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.row}>Pago: {item.id}</Text>
            <Text style={styles.row}> Fecha: {item.fecha}</Text>
            <Text style={styles.row}> Cliente: {item.cliente}</Text>
            <Text style={styles.row}> Emprendedor: {item.emprendedor}</Text>
            <Text style={styles.row}> Total: {item.total}</Text>
            <Text style={[styles.row, styles.estado]}>{item.estado}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    paddingBottom: 45,
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
  row: { fontSize: 15, marginBottom: 4, color: '#333' },
  estado: { fontWeight: 'bold', color: '#006400' },
});

export default PagosScreen;
