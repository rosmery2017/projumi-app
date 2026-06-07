import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- Datos de Ejemplo (Productos) ---
// (Tu lista de 'initialProducts' completa iría aquí... la acorto por brevedad)
const initialProducts = [
  {
    id: '1',
    name: 'Rosmery Mejias',
    category: 'Reposteria',
    price: 15.5,
    entrepreneur: 'Dulce Mordida',
    description:
      'Deliciosas tostas y galletas artesanales, crujientes y llenas de sabor.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/dulce_mordida.jpg',
  },
  {
    id: '7',
    name: 'Efrain Pastran',
    category: 'Reposteria',
    price: 20.0,
    entrepreneur: 'Leche y Miel',
    description:
      'Dulces delicionsas expecializados en la elaboracion de granolas',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/leche_miel.jpg',
  },
  {
    id: '2',
    name: 'Muñeca Tejida',
    category: 'Muñequeria',
    price: 25.0,
    entrepreneur: 'Hilos Mágicos',
    description:
      'Muñeca suave y colorida, ideal para niños. Ojos de seguridad.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/Verónica Diseño.jpeg',
  },
  {
    id: '3',
    name: 'Torta de Chocolate',
    category: 'Reposteria',
    price: 18.0,
    entrepreneur: 'Dulces Experiencia',
    description: 'Torta húmeda de chocolate con triple capa de fudge.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/dulce_experiencia.jpg',
  },
  {
    id: '5',
    name: 'Cojín Bordado',
    category: 'Decoraciones',
    price: 30.0,
    entrepreneur: 'Hogar y Estilo',
    description: 'Cojín decorativo con bordado floral. Incluye relleno.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/Maikelys.jpeg',
  },
  {
    id: '6',
    name: 'Set de Velas',
    category: 'Manualidades',
    price: 12.0,
    entrepreneur: 'Artesanía Luz',
    description:
      'Set de tres velas con esencias naturales de lavanda y vainilla.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/Karla.jpeg',
  },
  {
    id: '13',
    name: 'Pulsera de Cuero',
    category: 'Bisuteria',
    price: 14.0,
    entrepreneur: 'Cuero & Más',
    description: 'Pulsera de cuero trenzado con dije de metal.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/Marilú y Gerardo.jpeg',
  },
  {
    id: '14',
    name: 'Maceta Colgante',
    category: 'Arte movil',
    price: 28.0,
    entrepreneur: 'Verde Vida',
    description: 'Maceta de macramé para colgar plantas.',
    imageSource:
      'https://groupforcetechnology.ct.ws/public/emprendedores/Samaira, carpintería.jpeg',
  },
]; // ... y el resto de tus productos

// --- Lista de Categorías (sin cambios) ---
const categories = [
  'Ver Todo',
  'Bisuteria',
  'Muñequeria',
  'Reposteria',
  'Arte movil',
  'Decoraciones',
  'Manualidades',
];

// --- NUEVA LÓGICA: Añadimos descripciones simuladas para los emprendedores ---
const entrepreneurDescriptions = {
  'Joyas Ana':
    'Especialistas en joyería fina y perlas cultivadas con más de 10 años de experiencia.',
  'Hilos Mágicos':
    'Creamos muñecos de trapo y amigurumis con materiales 100% hipoalergénicos.',
  'Peluchería Feliz':
    'Los osos de peluche más suaves y abrazables, hechos con amor.',
  'Dulces Tentaciones':
    'Repostería artesanal para eventos. Usamos solo ingredientes de la mejor calidad.',
  'La Abuela':
    'Las recetas tradicionales de galletas y postres, horneadas como en casa.',
  'Case Art':
    'Convertimos tu funda de celular en una obra de arte única y personalizada.',
  TechAccesorios: 'Gadgets y accesorios prácticos para tu vida digital.',
  'Hogar y Estilo':
    'Decoración textil que le da un toque cálido y moderno a tu hogar.',
  'Barro y Arte':
    'Cerámica de autor. Piezas únicas que combinan funcionalidad y diseño.',
  'Artesanía Luz': 'Velas aromáticas y manualidades que iluminan tu espacio.',
  'Pinta Fácil':
    'Kits de "hazlo tú mismo" para que desates tu creatividad sin complicaciones.',
  'Cuero & Más':
    'Artículos de cuero genuino, desde pulseras hasta billeteras, con un toque rústico.',
  'Verde Vida': 'Soluciones creativas para llenar tu hogar de plantas y vida.',
  'Melodía Artesana':
    'Cajas musicales y pequeños detalles en madera que cuentan una historia.',
};

// --- Lógica para transformar Productos en Emprendedores Únicos ---
const entrepreneursMap = new Map();
initialProducts.forEach((product) => {
  if (!entrepreneursMap.has(product.entrepreneur)) {
    entrepreneursMap.set(product.entrepreneur, {
      id: product.entrepreneur,
      name: product.entrepreneur,
      categories: new Set([product.category]),
      imageSource: product.imageSource,
      // Añadimos la descripción simulada
      description:
        entrepreneurDescriptions[product.entrepreneur] ||
        'Un increíble emprendedor de Projumi.',
    });
  } else {
    entrepreneursMap.get(product.entrepreneur).categories.add(product.category);
  }
});

const allEntrepreneurs = Array.from(entrepreneursMap.values()).map((emp) => ({
  ...emp,
  categoriesArray: Array.from(emp.categories),
  categoryString: Array.from(emp.categories).join(', '),
  description: emp.description, // Aseguramos que la descripción esté en el objeto final
}));

// --- Componente Principal Fusionado ---
const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Ver Todo');

  // --- ESTADO DEL MODAL RE-AÑADIDO ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);

  // Lógica de filtrado de emprendedores (sin cambios)
  const filteredEntrepreneurs = allEntrepreneurs.filter((emp) => {
    if (selectedCategory === 'Ver Todo') {
      return true;
    }
    return emp.categoriesArray.includes(selectedCategory);
  });

  // Función "Comencemos" (sin cambios)
  const handleComencemosPress = () => {
    navigation.navigate('Productos');
  };

  // --- FUNCIONES DEL MODAL RE-AÑADIDAS ---

  // 1. Abrir modal
  const showEntrepreneurDetails = (entrepreneur) => {
    setSelectedEntrepreneur(entrepreneur);
    setModalVisible(true);
  };

  // 2. Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedEntrepreneur(null); // Limpiamos la selección
  };

  // 3. Navegar a los productos del emprendedor
  const handleViewProducts = (entrepreneurName) => {
    closeModal(); // Cerramos el modal

    // Navegamos a la pantalla 'Productos' y le pasamos un parámetro.
    // Tu pantalla 'ProductListScreen' necesitaría ser ajustada
    // para leer este parámetro y filtrar por emprendedor.
    navigation.navigate('Productos', { entrepreneurFilter: entrepreneurName });
  };

  // --- Renderizado de la Tarjeta de EMPRENDEDOR (ACTUALIZADA) ---
  const renderEntrepreneurCard = ({ item }) => (
    <View style={styles.productCard}>
      {item.imageSource?.startsWith('http') ? (
        <Image
          source={{ uri: item.imageSource }}
          style={styles.imagePlaceholder}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: item.imageSource },
          ]}
        />
      )}

      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productCategory}>
        Categorías: {item.categoryString}
      </Text>

      {/* --- BOTÓN "VER MÁS" RE-AÑADIDO --- */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => showEntrepreneurDetails(item)}>
        <Text style={styles.detailsButtonText}>Ver más</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Componente de Cabecera para la FlatList (sin cambios) ---
  const ListHeader = () => (
    <>
      <View style={styles.headerContent}>
        <Icon name="store" size={60} color="#14532d" style={styles.icon} />
        <Text style={styles.title}>¡Bienvenido, Jesús!</Text>
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
    <StatusBar barStyle="light-content" backgroundColor="##006400" />
      <FlatList
        data={filteredEntrepreneurs}
        keyExtractor={(item) => item.id}
        renderItem={renderEntrepreneurCard}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
      />

      {/* --- MODAL PARA DETALLES DEL EMPRENDEDOR (RE-AÑADIDO) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Usamos 'selectedEntrepreneur' para mostrar los datos */}
            {selectedEntrepreneur && (
              <>
                <View
                  style={[
                    styles.modalImagePlaceholder,
                    { backgroundColor: selectedEntrepreneur.imageSource },
                  ]}
                />

                <Text style={styles.modalTitle}>
                  {selectedEntrepreneur.name}
                </Text>

                <Text style={styles.modalCategories}>
                  Especialidades: {selectedEntrepreneur.categoryString}
                </Text>

                <ScrollView style={styles.descriptionScrollView}>
                  <Text style={styles.modalDescription}>
                    {selectedEntrepreneur.description}
                  </Text>
                </ScrollView>

                {/* --- BOTÓN PARA VER PRODUCTOS --- */}
                <TouchableOpacity
                  style={styles.viewProductsButton}
                  onPress={() => handleViewProducts(selectedEntrepreneur.name)}>
                  <Text style={styles.viewProductsButtonText}>
                    🛒 Ver sus Productos
                  </Text>
                </TouchableOpacity>

                {/* --- Botón Cerrar --- */}
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

// --- Estilos Fusionados y Re-añadidos ---
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
