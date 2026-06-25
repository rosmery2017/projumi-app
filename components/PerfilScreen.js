import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getDisplayName } from './../utils/userDisplay';

const getMemberSince = (user) => {
  const rawDate =
    user?.createdAt ||
    user?.created_at ||
    user?.registrationDate ||
    user?.fechaRegistro ||
    user?.joinedAt ||
    null;

  if (!rawDate) {
    return null;
  }

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.getFullYear();
};

const PerfilScreen = ({ route, navigation }) => {
  const { user, signOut } = useAuth();
  const currentUser = route?.params?.user || user || {};
  const displayName = getDisplayName(currentUser);
  const memberSince = getMemberSince(currentUser);

  const handleLogout = () => {
    Alert.alert('Cerrar sesion', 'Deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Si',
        onPress: () => {
          signOut();

          const parentNavigation = navigation.getParent();
          if (parentNavigation) {
            parentNavigation.dispatch(StackActions.replace('Login'));
            return;
          }

          navigation.navigate('Login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profilePicContainer}>
          <Image
            source={{
              uri: 'https://static.vecteezy.com/system/resources/previews/047/733/682/non_2x/grey-avatar-icon-user-avatar-photo-icon-social-media-user-icon-vector.jpg',
            }}
            style={styles.profilePic}
          />
          <TouchableOpacity style={styles.btnChangePic}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileRole}>
          {currentUser.email || currentUser.correo || 'Sesion conectada con Projumi'}
        </Text>
        {memberSince ? (
          <Text style={styles.profileMeta}>Miembro desde: {memberSince}</Text>
        ) : null}

        <View style={styles.rating}>
          <FontAwesome5 name="star" size={18} color="#FFD700" />
          <FontAwesome5 name="star" size={18} color="#FFD700" />
          <FontAwesome5 name="star" size={18} color="#FFD700" />
          <FontAwesome5 name="star" size={18} color="#FFD700" />
          <FontAwesome5 name="star" size={18} color="#ccc" />
          <Text style={styles.ratingText}> 4.2 (12 reseñas)</Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person" size={22} color="#006400" />
          <Text style={styles.menuText}>Mi perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Pedidos')}>
          <Ionicons name="list" size={22} color="#006400" />
          <Text style={styles.menuText}>Mis pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Compras')}>
          <Ionicons name="bag-check" size={22} color="#006400" />
          <Text style={styles.menuText}>Mis compras</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color="#ff4d4d" />
          <Text style={[styles.menuText, { color: '#ff4d4d' }]}>
            Cerrar sesion
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  profilePicContainer: { position: 'relative', marginBottom: 15 },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#87CEEB',
  },
  btnChangePic: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#8B4513',
    borderRadius: 20,
    padding: 6,
  },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#006400' },
  profileRole: { fontSize: 14, color: '#8B4513', marginBottom: 10 },
  profileMeta: { fontSize: 14, color: '#8B4513', marginBottom: 10 },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { marginLeft: 8, color: '#555' },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  menuText: { fontSize: 16, marginLeft: 12, color: '#333' },
  logoutButton: { borderBottomWidth: 0 },
});

export default PerfilScreen;
