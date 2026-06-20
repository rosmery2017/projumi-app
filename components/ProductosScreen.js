import React, { useMemo, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFetch from './../hooks/useFetch';
import { buildApiUrl } from './../config/api';
import { useAuth } from './../context/AuthContext';
import { useCart } from './../context/CartContext';

const { width } = Dimensions.get('window');

const formatPrice = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `$${numericValue.toFixed(2)}` : '$0.00';
};

export default function ProductosScreen({ navigation, route }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productosPorPagina = 6;
  const entrepreneurFilter = route?.params?.entrepreneurFilter;
  const { token, isReady: authReady } = useAuth();
  const { addToCart } = useCart();

  const { data, loading, error, refetch } = useFetch(
    buildApiUrl('/productos/mostrarProductos'),
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    authReady && Boolean(token)
  );

  if (error) {
    console.log('ProductosScreen error:', {
      message: error?.message,
      stack: error?.stack,
      tokenPresent: Boolean(token),
      authReady,
      entrepreneurFilter,
    });
  }

  const productos = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

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

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const categoriaValida =
        categoriaSeleccionada === 'Todos' ||
        producto.categoria === categoriaSeleccionada;

      const emprendedorValido =
        !entrepreneurFilter ||
        producto.emprendedor === entrepreneurFilter ||
        producto.id_emprededor?.toString() === entrepreneurFilter?.toString();

      const searchValido =
        !searchTerm ||
        `${producto.nombre} ${producto.categoria || ''} ${producto.descripcion || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim());

      return categoriaValida && emprendedorValido && searchValido;
    });
  }, [categoriaSeleccionada, entrepreneurFilter, productos, searchTerm]);

  const indiceInicial = (paginaActual - 1) * productosPorPagina;
  const indiceFinal = indiceInicial + productosPorPagina;
  const productosPagina = productosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  if (!authReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#14532d" />
        <Text style={styles.loadingText}>Restaurando sesion...</Text>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>
          Tu sesion no esta activa. Inicia sesion nuevamente para ver productos.
        </Text>
        <TouchableOpacity
          style={styles.botonReintentar}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.textoBotonDetalle}>Ir al login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const abrirDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setCantidadSeleccionada(1);
    setModalVisible(true);
  };

  const stockDisponible = Number(productoSeleccionado?.stock);
  const stockMaximo =
    Number.isFinite(stockDisponible) && stockDisponible > 0 ? stockDisponible : null;
  const puedeComprar = !Number.isFinite(stockDisponible) || stockDisponible > 0;

  const ajustarCantidad = (delta) => {
    setCantidadSeleccionada((current) => {
      const siguiente = Math.max(1, current + delta);
      if (stockMaximo) {
        return Math.min(siguiente, stockMaximo);
      }
      return siguiente;
    });
  };

  const anadirAlCarrito = (producto, cantidad = 1) => {
    addToCart(producto, cantidad);
    Alert.alert(
      'Producto añadido',
      `"${producto.nombre}" se añadió al carrito x${cantidad}.`,
      [
      { text: 'Seguir comprando', style: 'cancel' },
      { text: 'Ver carrito', onPress: () => navigation.navigate('Carrito') },
      ]
    );
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const renderProducto = ({ item }) => (
    <View style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
      ) : (
        <View style={[styles.imagen, styles.imagenVacia]} />
      )}

      <View style={styles.cardBody}>
        <Text style={styles.categoriaPill} numberOfLines={1}>
          {item.categoria || 'Sin categoria'}
        </Text>
        <Text style={styles.nombreProducto} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.descripcionProducto} numberOfLines={2}>
          {item.descripcion || 'Producto disponible en el catalogo de PROJUMI.'}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.precio}>{formatPrice(item.precio)}</Text>
          <Text style={styles.stock}>{item.stock ?? 'N/D'} stock</Text>
        </View>

        <TouchableOpacity
          style={styles.botonDetalle}
          onPress={() => abrirDetalle(item)}>
          <Text style={styles.textoBotonDetalle}>Ver detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCarrito}
          onPress={() => anadirAlCarrito(item)}>
          <Text style={styles.textoBotonCarrito}>Añadir al carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginacion = () => {
    if (totalPaginas <= 1) {
      return null;
    }

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
      <FlatList
        data={productosPagina}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Ionicons name="gift-outline" size={16} color="#14532d" />
                <Text style={styles.heroBadgeText}>Catalogo PROJUMI</Text>
              </View>
              <Text style={styles.title}>Nuestros Productos</Text>
              <Text style={styles.subtitle}>
                Explora el catalogo, filtra por categoria y añade productos al carrito.
              </Text>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#64748b" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar productos..."
                  placeholderTextColor="#94a3b8"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
            </View>

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
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.contador}>
              Mostrando {productosPagina.length} de {productosFiltrados.length} productos
            </Text>
          </>
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#14532d" />
                <Text style={styles.loadingText}>Cargando productos...</Text>
              </>
            ) : error ? (
              <>
                <Text style={styles.errorText}>
                  Error al cargar productos. Intenta de nuevo.
                </Text>
                <Text style={styles.errorDetail} numberOfLines={4}>
                  {error?.message || 'Sin detalle de error'}
                </Text>
                <TouchableOpacity style={styles.botonReintentar} onPress={refetch}>
                  <Text style={styles.textoBotonDetalle}>Reintentar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.emptyText}>No hay productos disponibles.</Text>
            )}
          </View>
        )}
      />

      {renderPaginacion()}

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {productoSeleccionado ? (
              <>
                {productoSeleccionado.imagen ? (
                  <Image
                    source={{ uri: productoSeleccionado.imagen }}
                    style={styles.modalImagen}
                  />
                ) : (
                  <View style={[styles.modalImagen, styles.imagenVacia]} />
                )}

                <Text style={styles.modalTitulo}>{productoSeleccionado.nombre}</Text>
                <Text style={styles.modalPrecio}>
                  {formatPrice(productoSeleccionado.precio)}
                </Text>
                <Text style={styles.modalDescripcion}>
                  {productoSeleccionado.descripcion || 'Sin descripcion disponible.'}
                </Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.modalEmprendedor}>
                    Emprendimiento: {productoSeleccionado.emprendedor || 'No disponible'}
                  </Text>
                  <Text style={styles.modalCategoria}>
                    Categoria: {productoSeleccionado.categoria || 'Sin categoria'}
                  </Text>
                  <Text style={styles.modalStock}>
                    Stock: {productoSeleccionado.stock ?? 'No disponible'}
                  </Text>
                </View>

                <View style={styles.quantitySection}>
                  <Text style={styles.quantityLabel}>Cantidad</Text>
                  <View style={styles.quantityStepper}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        cantidadSeleccionada === 1 && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => ajustarCantidad(-1)}
                      disabled={cantidadSeleccionada === 1}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <View style={styles.quantityValueBox}>
                      <Text style={styles.quantityValue}>{cantidadSeleccionada}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        !puedeComprar && styles.quantityButtonDisabled,
                        stockMaximo &&
                          cantidadSeleccionada >= stockMaximo &&
                          styles.quantityButtonDisabled,
                      ]}
                      onPress={() => ajustarCantidad(1)}
                      disabled={
                        !puedeComprar ||
                        (stockMaximo ? cantidadSeleccionada >= stockMaximo : false)
                      }>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {stockMaximo ? (
                    <Text style={styles.quantityHint}>
                      Máximo disponible: {stockMaximo}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[
                    styles.botonCarritoModal,
                    !puedeComprar && styles.botonCarritoDeshabilitado,
                  ]}
                  onPress={() => {
                    if (!puedeComprar) {
                      return;
                    }
                    anadirAlCarrito(productoSeleccionado, cantidadSeleccionada);
                    setModalVisible(false);
                  }}>
                  <Text style={styles.textoBotonCarritoModal}>
                    {puedeComprar ? `Añadir ${cantidadSeleccionada} al carrito` : 'Sin stock'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonCerrar}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  lista: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#14532d',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
  },
  filtroContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
    paddingBottom: 4,
  },
  botonCategoria: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCategoriaSeleccionado: {
    backgroundColor: '#14532d',
    borderColor: '#14532d',
  },
  textoCategoria: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
  },
  contador: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 10,
    fontSize: 14,
    paddingHorizontal: 15,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
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
  errorDetail: {
    marginBottom: 12,
    color: '#7f1d1d',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    minWidth: (width - 40) / 2,
  },
  imagen: {
    width: '100%',
    height: 140,
  },
  imagenVacia: {
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    padding: 12,
  },
  categoriaPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0f2fe',
    color: '#075985',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  nombreProducto: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 6,
    color: '#111827',
    minHeight: 38,
  },
  descripcionProducto: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  precio: {
    fontSize: 16,
    fontWeight: '900',
    color: '#14532d',
  },
  stock: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  botonDetalle: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  textoBotonDetalle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  botonCarrito: {
    backgroundColor: '#14532d',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  textoBotonCarrito: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  botonReintentar: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
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
    borderRadius: 22,
    padding: 22,
    width: '92%',
    maxWidth: 420,
    alignItems: 'center',
  },
  modalImagen: {
    width: 120,
    height: 120,
    borderRadius: 18,
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    color: '#111827',
  },
  modalPrecio: {
    fontSize: 22,
    fontWeight: '900',
    color: '#14532d',
    marginBottom: 12,
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
    marginBottom: 18,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  modalEmprendedor: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#2c3e50',
  },
  modalCategoria: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  modalStock: {
    fontSize: 14,
    color: '#6c757d',
  },
  botonCarritoModal: {
    backgroundColor: '#14532d',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  botonCarritoDeshabilitado: {
    backgroundColor: '#94a3b8',
  },
  textoBotonCarritoModal: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  quantitySection: {
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#14532d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  quantityValueBox: {
    minWidth: 72,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  quantityHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  botonCerrar: {
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#6c757d',
    width: '100%',
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '700',
  },
});
