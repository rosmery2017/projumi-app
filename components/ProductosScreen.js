import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProductosScreen() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6;

  // Datos de ejemplo de productos con imágenes reales
  const productos = [
    {
      id: '1',
      nombre: 'Collar de Perlas',
      precio: '$25.000',
      categoria: 'Bisuteria',
      descripcion:
        'Elegante collar de perlas naturales con cierre dorado de 18k, perfecto para ocasiones especiales.',
      emprendedor: 'María Rodríguez',
      imagen:
        'https://images.unsplash.com/photo-1599643478510-a34935077415?w=400',
    },
    {
      id: '2',
      nombre: 'Muñeca Artesanal',
      precio: '$35.000',
      categoria: 'Muñequeria',
      descripcion:
        'Encantadora muñeca de trapo hecha a mano con materiales ecológicos y detalles únicos.',
      emprendedor: 'Ana Gómez',
      imagen:
        'https://images.unsplash.com/photo-1589871020035-89a2b9c8411a?w=400',
    },
    {
      id: '3',
      nombre: 'Pastel de Chocolate',
      precio: '$18.000',
      categoria: 'Reposteria',
      descripcion:
        'Exquisito pastel de chocolate belga con relleno de crema y decoración artesanal.',
      emprendedor: 'Carlos López',
      imagen:
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    },
    {
      id: '4',
      nombre: 'Pintura Abstracta',
      precio: '$120.000',
      categoria: 'Arte movil',
      descripcion:
        'Obra de arte contemporáneo en acrílico sobre lienzo, expresión única de colores y formas.',
      emprendedor: 'Pedro Martínez',
      imagen:
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
    },
    {
      id: '5',
      nombre: 'Jarrón Cerámica',
      precio: '$45.000',
      categoria: 'Decoraciones',
      descripcion:
        'Hermoso jarrón de cerámica pintado a mano con diseños únicos y acabado brillante.',
      emprendedor: 'Laura Fernández',
      imagen:
        'https://images.unsplash.com/photo-1584735264932-96eef344d6bb?w=400',
    },
    {
      id: '6',
      nombre: 'Portalápices Artesanal',
      precio: '$15.000',
      categoria: 'Manualidades',
      descripcion:
        'Creativo portalápices hecho con materiales reciclados, ideal para tu espacio de trabajo.',
      emprendedor: 'Juan Pérez',
      imagen:
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
    },
    {
      id: '7',
      nombre: 'Aretes Dorados',
      precio: '$32.000',
      categoria: 'Bisuteria',
      descripcion:
        'Modernos aretes en baño de oro con detalles minimalistas, perfectos para el día a día.',
      emprendedor: 'Sofia Castro',
      imagen:
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    },
    {
      id: '8',
      nombre: 'Osito de Peluche',
      precio: '$28.000',
      categoria: 'Muñequeria',
      descripcion:
        'Suave osito de peluche hecho a mano, ideal como regalo para ocasiones especiales.',
      emprendedor: 'David Ramirez',
      imagen:
        'https://images.unsplash.com/photo-1589871020035-89a2b9c8411a?w=400',
    },
    {
      id: '9',
      nombre: 'Galletas Decoradas',
      precio: '$12.000',
      categoria: 'Reposteria',
      descripcion:
        'Deliciosas galletas decoradas a mano con glaseado real, disponibles en diversos diseños.',
      emprendedor: 'Elena Morales',
      imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    },
    {
      id: '10',
      nombre: 'Escultura Moderna',
      precio: '$85.000',
      categoria: 'Arte movil',
      descripcion:
        'Impresionante escultura en metal que representa el movimiento y la fluidez.',
      emprendedor: 'Ricardo Silva',
      imagen: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400',
    },
    {
      id: '11',
      nombre: 'Lámpara de Mesa',
      precio: '$55.000',
      categoria: 'Decoraciones',
      descripcion:
        'Elegante lámpara de mesa con base de madera y pantalla de lino, crea un ambiente acogedor.',
      emprendedor: 'Carmen Ruiz',
      imagen:
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    },
    {
      id: '12',
      nombre: 'Maceta Decorativa',
      precio: '$22.000',
      categoria: 'Manualidades',
      descripcion:
        'Original maceta pintada a mano con motivos naturales, perfecta para tus plantas.',
      emprendedor: 'Miguel Ángel',
      imagen:
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
    },
  ];

  const categorias = [
    'Todos',
    'Bisuteria',
    'Muñequeria',
    'Reposteria',
    'Arte movil',
    'Decoraciones',
    'Manualidades',
  ];

  // Filtrar productos por categoría
  const productosFiltrados =
    categoriaSeleccionada === 'Todos'
      ? productos
      : productos.filter(
          (producto) => producto.categoria === categoriaSeleccionada
        );

  // Calcular productos para la página actual
  const indiceInicial = (paginaActual - 1) * productosPorPagina;
  const indiceFinal = indiceInicial + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(
    productosFiltrados.length / productosPorPagina
  );

  // Función para ver más información del producto
  const verMasProducto = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  // Función para añadir al carrito
  const añadirAlCarrito = (producto) => {
    Alert.alert(
      'Producto Añadido',
      `"${producto.nombre}" se ha añadido al carrito`,
      [
        { text: 'Seguir Comprando', style: 'cancel' },
        { text: 'Ver Carrito', onPress: () => console.log('Ir al carrito') },
      ]
    );
  };

  // Cambiar de página
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Renderizar cada producto
  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <Text style={styles.nombreProducto}>{item.nombre}</Text>
      <Text style={styles.precio}>{item.precio}</Text>
      <Text style={styles.categoria}>{item.categoria}</Text>

      <TouchableOpacity
        style={styles.botonVerMas}
        onPress={() => verMasProducto(item)}>
        <Text style={styles.textoBoton}>Ver más</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar indicador de paginación
  const renderPaginacion = () => {
    if (totalPaginas <= 1) return null;

    return (
      <View style={styles.paginacionContainer}>
        <TouchableOpacity
          style={[
            styles.botonPaginaNav,
            paginaActual === 1 && styles.botonDeshabilitado,
          ]}
          onPress={() => cambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}>
          <Text style={styles.textoPaginaNav}>‹ Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.textoPaginaInfo}>
          Página {paginaActual} de {totalPaginas}
        </Text>

        <TouchableOpacity
          style={[
            styles.botonPaginaNav,
            paginaActual === totalPaginas && styles.botonDeshabilitado,
          ]}
          onPress={() => cambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}>
          <Text style={styles.textoPaginaNav}>Siguiente ›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Nuestros Productos</Text>

      {/* Filtro de categorías - VERSIÓN MEJORADA */}
      <View style={styles.filtroContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtroContent}>
          {categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[
                styles.botonCategoria,
                categoriaSeleccionada === categoria &&
                  styles.botonCategoriaSeleccionado,
              ]}
              onPress={() => {
                setCategoriaSeleccionada(categoria);
                setPaginaActual(1);
              }}>
              <Text style={styles.textoCategoria} numberOfLines={1}>
                {categoria}
              </Text>
              {categoriaSeleccionada === categoria && (
                <View style={styles.indicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contador de productos */}
      <Text style={styles.contador}>
        Mostrando {productosPagina.length} de {productosFiltrados.length}{' '}
        productos
      </Text>

      {/* Lista de productos */}
      <FlatList
        data={productosPagina}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      {/* Paginación */}
      {renderPaginacion()}

      {/* Modal para ver más información */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {productoSeleccionado && (
              <>
                <Image
                  source={{ uri: productoSeleccionado.imagen }}
                  style={styles.modalImagen}
                />
                <Text style={styles.modalTitulo}>
                  {productoSeleccionado.nombre}
                </Text>
                <Text style={styles.modalPrecio}>
                  {productoSeleccionado.precio}
                </Text>
                <Text style={styles.modalDescripcion}>
                  {productoSeleccionado.descripcion}
                </Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.modalEmprendedor}>
                    Emprendedor: {productoSeleccionado.emprendedor}
                  </Text>
                  <Text style={styles.modalCategoria}>
                    Categoría: {productoSeleccionado.categoria}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonCarrito}
                  onPress={() => {
                    añadirAlCarrito(productoSeleccionado);
                    setModalVisible(false);
                  }}>
                  <Text style={styles.textoBotonCarrito}>
                    {' '}
                    Añadir al Carrito
                  </Text>
                </TouchableOpacity>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  },
  filtroContainer: {
    marginBottom: 15,
    maxHeight: 60,
  },
  filtroContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
    paddingVertical: 5,
  },
  botonCategoria: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 110, // Tamaño fijo para evitar cambios
    maxWidth: 110, // Tamaño fijo para evitar cambios
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botonCategoriaSeleccionado: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textoCategoria: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600', // Peso fijo que no cambia el tamaño
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  contador: {
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 10,
    fontSize: 14,
    paddingHorizontal: 15,
  },
  lista: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minWidth: (width - 40) / 2,
  },
  imagen: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  nombreProducto: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  categoria: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
  },
  botonVerMas: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paginacionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  botonPaginaNav: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 90,
    alignItems: 'center',
  },
  textoPaginaNav: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  textoPaginaInfo: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalImagen: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalPrecio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
  modalDescripcion: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    color: '#495057',
    lineHeight: 22,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  modalEmprendedor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  modalCategoria: {
    fontSize: 14,
    color: '#6c757d',
  },
  botonCarrito: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  textoBotonCarrito: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCerrar: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6c757d',
  },
  textoBotonCerrar: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '600',
  },
});
