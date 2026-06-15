import React, { useState, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import useFetch from './../hooks/useFetch';
import { buildApiUrl } from './../config/api';

const { width } = Dimensions.get('window');

export default function ProductosScreen({ route }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6;
  const entrepreneurFilter = route?.params?.entrepreneurFilter;
  const token = route?.params?.token;

  const { data, loading, error, refetch } = useFetch(
    buildApiUrl('/productos/mostrarProductos'),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const productos = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      id: item.id_producto?.toString() ?? `${item.id_emprededor}-${item.nombre}`,
      nombre: item.nombre,
      precio: item.precio,
      categoria: item.categoria,
      descripcion: item.descripcion,
      emprendedor: item.emprendedor,
      imagen: item.imagenes?.[0] ? buildApiUrl(item.imagenes[0]) : null,
      stock: item.stock,
      id_categoria: item.id_categoria,
      id_emprededor: item.id_emprededor,
      status: item.status,
      fecha_ingreso: item.fecha_ingreso,
    }));
  }, [data]);

  const categorias = useMemo(() => {
    const setCat = new Set(['Todos']);
    productos.forEach((producto) => {
      if (producto.categoria) {
        setCat.add(producto.categoria);
      }
    });
    return Array.from(setCat).sort((a, b) => {
      if (a === 'Todos') return -1;
      if (b === 'Todos') return 1;
      return a.localeCompare(b);
    });
  }, [productos]);

  const productosFiltrados = productos.filter((producto) => {
    const categoriaValida =
      categoriaSeleccionada === 'Todos' ||
      producto.categoria === categoriaSeleccionada;

    const emprendedorValido =
      !entrepreneurFilter ||
      producto.emprendedor === entrepreneurFilter ||
      producto.id_emprededor?.toString() === entrepreneurFilter?.toString();

    return categoriaValida && emprendedorValido;
  });

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
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
      ) : (
        <View style={[styles.imagen, { backgroundColor: '#e2e8f0' }]} />
      )}
      <Text style={styles.nombreProducto}>{item.nombre}</Text>
      <Text style={styles.precio}>
        {typeof item.precio === 'number' ? `$${item.precio.toFixed(2)}` : item.precio}
      </Text>
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#14532d" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Error al cargar productos. Intenta de nuevo.
          </Text>
          <TouchableOpacity style={styles.botonVerMas} onPress={refetch}>
            <Text style={styles.textoBoton}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productosPagina}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No hay productos disponibles.
              </Text>
            </View>
          )}
        />
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 14,
    color: '#4b5563',
    fontSize: 16,
  },
  errorText: {
    marginBottom: 12,
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
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
