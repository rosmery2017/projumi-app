import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView, // Asegúrate de que ScrollView esté importado para el modal
  Modal,
  Image, // <-- RE-IMPORTADO
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useFetch from './../hooks/useFetch';
import { buildApiUrl } from './../config/api';
import { useAuth } from './../context/AuthContext';
import { getDisplayName } from './../utils/userDisplay';

const HOME_API_PATH = '/emprendedor/mostrarEmprendedores';

const getImageUrl = (imagePath) =>
  imagePath?.startsWith('http') ? imagePath : buildApiUrl(imagePath || '');

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Ver Todo');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);
  const { user } = useAuth();

  const displayName = useMemo(() => getDisplayName(user), [user]);

  const { data, loading, error, refetch } = useFetch(
    buildApiUrl(HOME_API_PATH)
  );

  const entrepreneurs = data || [];

  const categories = useMemo(() => {
    const categorySet = new Set();
    entrepreneurs.forEach((emp) => {
      emp.categorias?.forEach((cat) => {
        if (cat?.nombre) {
          categorySet.add(cat.nombre);
        }
      });
    });
    return ['Ver Todo', ...Array.from(categorySet).sort()];
  }, [entrepreneurs]);

  const filteredEntrepreneurs = entrepreneurs.filter((emp) => {
    if (selectedCategory === 'Ver Todo') {
      return true;
    }
    return emp.categorias?.some((cat) => cat.nombre === selectedCategory);
  });

  const handleComencemosPress = () => {
    navigation.navigate('Productos');
  };

  const showEntrepreneurDetails = (entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEntrepreneur(null);
  };

  const handleViewProducts = (entrepreneurName) => {
    closeModal();
    navigation.navigate('Productos', { entrepreneurFilter: entrepreneurName });
  };

  const renderEntrepreneurCard = ({ item }) => {
    const categoryString = item.categorias
      ?.map((cat) => cat.nombre)
      .filter(Boolean)
      .join(', ') || 'Sin categorías';

    return (
      <View style={styles.productCard}>
        <Image
          source={{ uri: getImageUrl(item.imagen) }}
          style={styles.imagePlaceholder}
          resizeMode="cover"
        />
        <Text style={styles.productName} numberOfLines={2}>
          {item.nombre_completo}
        </Text>
        <Text style={styles.productCategory} numberOfLines={1}>
          {item.emprendimiento}
        </Text>
        <Text style={styles.productCategory} numberOfLines={2}>
          {categoryString}
        </Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => showEntrepreneurDetails(item)}>
          <Text style={styles.detailsButtonText}>Ver más</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.headerContent}>
        <Icon name="store" size={60} color="#14532d" style={styles.icon} />
        <Text style={styles.title}>¡Bienvenido, {displayName}!</Text>
        <Text style={styles.description}>
          Estás en <Text style={{ fontWeight: 'bold' }}>Projumi</Text>, una red
          exclusiva para emprendedores. Aquí podrás vender y descubrir productos
          únicos como bisutería, arte móvil y mucho más.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleComencemosPress}>
          <Text style={styles.buttonText}>¡Comencemos!</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subHeaderText}>Conoce a nuestros Emprendedores</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilterContent}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.selectedCategoryButtonText,
              ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#006400" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14532d" />
          <Text style={styles.loadingText}>Cargando emprendedores...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Error al cargar emprendedores. Por favor intenta de nuevo.
          </Text>
          <TouchableOpacity style={styles.button} onPress={refetch}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEntrepreneurs}
          keyExtractor={(item) =>
            item.id_emprendedor?.toString() || item.nombre_completo
          }
          renderItem={renderEntrepreneurCard}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay emprendedores disponibles para esta categoría.
              </Text>
            </View>
          )}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedEntrepreneur && (
              <>
                <Image
                  source={{ uri: getImageUrl(selectedEntrepreneur.imagen) }}
                  style={styles.modalImagePlaceholder}
                  resizeMode="cover"
                />
                <Text style={styles.modalTitle}>
                  {selectedEntrepreneur.nombre_completo}
                </Text>
                <Text style={styles.modalCategories}>
                  {selectedEntrepreneur.emprendimiento}
                </Text>
                <ScrollView style={styles.descriptionScrollView}>
                  <Text style={styles.modalDescription}>
                    {selectedEntrepreneur.categorias
                      ?.map((cat) => cat.nombre)
                      .filter(Boolean)
                      .join(', ') || 'Sin categorías'}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.viewProductsButton}
                  onPress={() => handleViewProducts(selectedEntrepreneur.emprendimiento)}>
                  <Text style={styles.viewProductsButtonText}>
                    🛒 Ver sus Productos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Estilos de container, headerContent, icon, title, description, button, buttonText - sin cambios)
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContent: {
    padding: 20,
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#14532d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ... (Estilos de subHeaderText, categoryFilterContent, categoryButton, etc. - sin cambios)
  subHeaderText: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    color: '#2c3e50',
  },
  categoryFilterContent: {
    paddingHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  selectedCategoryButton: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  categoryButtonText: {
    color: '#34495e',
    fontWeight: '500',
    fontSize: 12,
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: '700',
  },

  // --- Estilos de la Lista de Emprendedores (Tarjeta actualizada) ---
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#4b5563',
    fontSize: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
  },
  productCard: {
    // Estilo de tarjeta de emprendedor
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
    // Ajustamos la altura mínima para el nuevo botón
    minHeight: 220,
    justifyContent: 'space-between', // Para empujar el botón hacia abajo
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 5,
    flexShrink: 1, // Permite que el texto se acorte si es necesario
  },

  // --- ESTILOS RE-AÑADIDOS para el botón de la tarjeta ---
  detailsButton: {
    backgroundColor: '#2ecc71',
    padding: 8, // Un poco más grande
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8, // Espacio antes del botón
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12, // Un poco más grande
  },

  // --- ESTILOS RE-AÑADIDOS para el Modal ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: '90%',
    maxHeight: '80%',
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  modalCategories: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  descriptionScrollView: {
    maxHeight: 120, // Altura máxima para la descripción
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  modalDescription: {
    fontSize: 15,
    textAlign: 'center',
    color: '#34495e',
    lineHeight: 22,
  },
  viewProductsButton: {
    // Estilo para el nuevo botón del modal
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15, // Espacio después de la descripción
  },
  viewProductsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  closeButtonText: {
    color: '#34495e',
    fontWeight: '600',
  },
});

export default HomeScreen;
