import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';

//  COMPONENTE PRINCIPAL - LISTA DE VENTAS
const SalesManagementScreen = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' o 'register'
  const [sales, setSales] = useState([]); // Lista de todas las ventas

  //  FUNCIÓN PARA AGREGAR NUEVA VENTA
  const addNewSale = (saleData) => {
    const newSale = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      ...saleData,
    };
    setSales((prevSales) => [newSale, ...prevSales]);
    setCurrentView('list');
  };

  // FUNCIÓN PARA CALCULAR TOTAL DE VENTAS
  const calculateTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  // RENDERIZAR ITEM DE VENTA
  const renderSaleItem = ({ item }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleId}>Venta #{item.id.slice(-4)}</Text>
        <Text style={styles.saleDate}>{item.timestamp}</Text>
      </View>

      <View style={styles.saleDetails}>
        <Text style={styles.clientName}>
          {item.clientData.nombre} {item.clientData.apellido}
        </Text>
        <Text style={styles.saleProducts}>
          {item.products.length} producto(s)
        </Text>
      </View>

      <View style={styles.saleFooter}>
        <Text style={styles.saleTotal}>${item.total.toFixed(2)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'completed'
              ? styles.statusCompleted
              : styles.statusPending,
          ]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Completada' : 'Pendiente'}
          </Text>
        </View>
      </View>
    </View>
  );

  // VISTA DE LISTA DE VENTAS
  if (currentView === 'list') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* HEADER */}
          <View style={styles.header}>
            <Image
              source={{
                uri: 'https://via.placeholder.com/80x80/28a745/ffffff?text=',
              }}
              style={styles.logo}
            />
            <Text style={styles.title}>Ventas Presenciales</Text>
            <Text style={styles.subtitle}>Gestión de ventas registradas</Text>
          </View>

          {/* ESTADÍSTICAS */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{sales.length}</Text>
              <Text style={styles.statLabel}>Ventas Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                ${calculateTotalSales().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Ingresos Totales</Text>
            </View>
          </View>

          {/* BOTÓN REGISTRAR VENTA*/}
          <TouchableOpacity
            style={styles.registerMainButton}
            onPress={() => setCurrentView('register')}>
            <Text style={styles.registerMainButtonText}>
              + Registrar Nueva Venta
            </Text>
          </TouchableOpacity>

          {/* LISTA DE VENTAS */}
          {sales.length > 0 ? (
            <FlatList
              data={sales}
              renderItem={renderSaleItem}
              keyExtractor={(item) => item.id}
              style={styles.salesList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay ventas registradas
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Presiona "Registrar Nueva Venta" para comenzar
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  //  VISTA DE REGISTRO DE VENTA
  return (
    <SalesRegisterScreen
      onSaveSale={addNewSale}
      onCancel={() => setCurrentView('list')}
    />
  );
};

// COMPONENTE DE REGISTRO DE VENTA
const SalesRegisterScreen = ({ onSaveSale, onCancel }) => {
  //ESTADO PARA CONTROLAR EL PASO ACTUAL
  const [currentStep, setCurrentStep] = useState(1);

  //  ESTADO PARA DATOS DEL CLIENTE (PASO 1)
  const [clientData, setClientData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });

  //  ESTADO PARA PRODUCTOS (PASO 2)
  const [products, setProducts] = useState([
    { id: 1, producto: '', precio: 0, cantidad: 1, subtotal: 0 },
  ]);

  // ESTADO PARA MÉTODOS DE PAGO (PASO 3)
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, metodo: '', moneda: '', referencia: '', monto: '' },
  ]);

  //  ESTADOS PARA MODALES Y UI
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // DATOS PREDEFINIDOS
  const availableProducts = [
    { id: 1, name: 'Granolas', price: 1 },
    { id: 2, name: 'Gorras', price: 5 },
    { id: 3, name: 'Artesanía', price: 3 },
    { id: 4, name: 'Torta', price: 10 },
    { id: 5, name: 'Franelas', price: 7 },
  ];

  const paymentOptions = ['Efectivo', 'Pago Móvil', 'Transferencia', 'Tarjeta'];
  const currencies = ['Bs', '$'];

  // FUNCIONES PARA EL PASO 1 - DATOS DEL CLIENTE
  const handleClientDataChange = (field, value) => {
    setClientData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    if (!clientData.cedula || !clientData.nombre || !clientData.apellido) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return false;
    }
    return true;
  };

  // FUNCIONES PARA EL PASO 2 - PRODUCTOS
  const handleProductSelect = (index, productName) => {
    const selectedProduct = availableProducts.find(
      (p) => p.name === productName
    );
    const updatedProducts = [...products];

    if (selectedProduct) {
      updatedProducts[index] = {
        ...updatedProducts[index],
        producto: productName,
        precio: selectedProduct.price,
        subtotal: selectedProduct.price * updatedProducts[index].cantidad,
      };
    }

    setProducts(updatedProducts);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedProducts = [...products];
    const qty = parseInt(quantity) || 0;

    updatedProducts[index] = {
      ...updatedProducts[index],
      cantidad: qty,
      subtotal: updatedProducts[index].precio * qty,
    };

    setProducts(updatedProducts);
  };

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      producto: '',
      precio: 0,
      cantidad: 1,
      subtotal: 0,
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    }
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => total + product.subtotal, 0);
  };

  const validateStep2 = () => {
    const hasEmptyProducts = products.some(
      (product) => !product.producto || product.cantidad <= 0
    );
    if (hasEmptyProducts) {
      Alert.alert('Error', 'Por favor completa todos los productos');
      return false;
    }
    return true;
  };

  // FUNCIONES PARA EL PASO 3 - PAGOS
  const handlePaymentMethodChange = (index, method) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index].metodo = method;

    if (method === 'Efectivo') {
      updatedMethods[index].moneda = '';
    } else if (method === 'Pago Móvil' || method === 'Transferencia') {
      updatedMethods[index].moneda = 'Bs';
    }

    setPaymentMethods(updatedMethods);
  };

  const handleCurrencyChange = (index, currency) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index].moneda = currency;
    setPaymentMethods(updatedMethods);
  };

  const handlePaymentAmountChange = (index, amount) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index].monto = amount;
    setPaymentMethods(updatedMethods);
  };

  const handleReferenceChange = (index, reference) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index].referencia = reference;
    setPaymentMethods(updatedMethods);
  };

  const addPaymentMethod = () => {
    const newMethod = {
      id: paymentMethods.length + 1,
      metodo: '',
      moneda: '',
      referencia: '',
      monto: '',
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const removePaymentMethod = (index) => {
    if (paymentMethods.length > 1) {
      const updatedMethods = paymentMethods.filter((_, i) => i !== index);
      setPaymentMethods(updatedMethods);
    }
  };

  const calculateTotalPaid = () => {
    return paymentMethods.reduce((total, method) => {
      return total + (parseFloat(method.monto) || 0);
    }, 0);
  };

  const calculateRemaining = () => {
    return calculateTotal() - calculateTotalPaid();
  };

  const isReferenceEnabled = (method) => {
    return method === 'Pago Móvil' || method === 'Transferencia';
  };

  const isCurrencySelectable = (method) => {
    return method === 'Efectivo';
  };

  const validateStep3 = () => {
    const totalPaid = calculateTotalPaid();
    const total = calculateTotal();

    if (totalPaid < total) {
      Alert.alert(
        'Error',
        `Falta por pagar: $${(total - totalPaid).toFixed(2)}`
      );
      return false;
    }

    for (let method of paymentMethods) {
      if (!method.metodo || !method.monto || parseFloat(method.monto) <= 0) {
        Alert.alert('Error', 'Completa todos los métodos de pago');
        return false;
      }

      if (isReferenceEnabled(method.metodo) && !method.referencia) {
        Alert.alert('Error', 'Ingresa la referencia para pagos electrónicos');
        return false;
      }
    }

    return true;
  };

  // FUNCIONES DE NAVEGACIÓN
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Registro',
      '¿Estás seguro de que quieres cancelar este registro?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          onPress: onCancel,
        },
      ]
    );
  };

  const handleRegisterSale = () => {
    if (!validateStep3()) return;

    const saleData = {
      clientData: { ...clientData },
      products: products.map((p) => ({ ...p })),
      paymentMethods: paymentMethods.map((p) => ({ ...p })),
      total: calculateTotal(),
      totalPaid: calculateTotalPaid(),
      status: calculateRemaining() <= 0 ? 'completed' : 'pending',
    };

    onSaveSale(saleData);

    Alert.alert(
      '¡Venta Registrada Exitosamente!',
      `Total: $${calculateTotal().toFixed(2)}\nCliente: ${clientData.nombre} ${
        clientData.apellido
      }`,
      [{ text: 'OK' }]
    );
  };

  //COMPONENTE DE PROGRESO
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / 3) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.stepsContainer}>
        <Text style={[styles.stepText, currentStep >= 1 && styles.activeStep]}>
          1. Cliente
        </Text>
        <Text style={[styles.stepText, currentStep >= 2 && styles.activeStep]}>
          2. Productos
        </Text>
        <Text style={[styles.stepText, currentStep >= 3 && styles.activeStep]}>
          3. Pago
        </Text>
      </View>
    </View>
  );

  // RENDERIZADO POR PASOS
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://via.placeholder.com/80x80/28a745/ffffff?text=💰',
            }}
            style={styles.logo}
          />
          <Text style={styles.title}>Registro de Venta</Text>
          <Text style={styles.subtitle}>Sistema de ventas presenciales</Text>
        </View>

        {/* BARRA DE PROGRESO */}
        <ProgressBar />

        {/* FORMULARIO POR PASOS */}
        <View style={styles.form}>
          {/* PASO 1: DATOS DEL CLIENTE */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Datos del Cliente</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cédula *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: V-12345678"
                  value={clientData.cedula}
                  onChangeText={(text) =>
                    handleClientDataChange('cedula', text)
                  }
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.label}>Nombre *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={clientData.nombre}
                    onChangeText={(text) =>
                      handleClientDataChange('nombre', text)
                    }
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.label}>Apellido *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apellido"
                    value={clientData.apellido}
                    onChangeText={(text) =>
                      handleClientDataChange('apellido', text)
                    }
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 0412-1234567"
                  value={clientData.telefono}
                  onChangeText={(text) =>
                    handleClientDataChange('telefono', text)
                  }
                  keyboardType="phone-pad"
                />
              </View>

              {/* BOTONES PASO 1 - CANCELAR Y SIGUIENTE */}
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PASO 2: PRODUCTOS */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Productos Vendidos</Text>

              {products.map((product, index) => (
                <View key={product.id} style={styles.productContainer}>
                  {products.length > 1 && (
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Producto {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeProduct(index)}>
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Producto *</Text>
                    <TouchableOpacity
                      style={styles.selectInput}
                      onPress={() => {
                        setActiveIndex(index);
                        setShowProductPicker(true);
                      }}>
                      <Text
                        style={
                          product.producto
                            ? styles.selectText
                            : styles.placeholderText
                        }>
                        {product.producto || 'Selecciona un producto'}
                      </Text>
                      <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                      <Text style={styles.label}>Precio Unitario</Text>
                      <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={`$${product.precio.toFixed(2)}`}
                        editable={false}
                      />
                    </View>

                    <View style={[styles.inputContainer, styles.halfInput]}>
                      <Text style={styles.label}>Cantidad *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={product.cantidad.toString()}
                        onChangeText={(text) =>
                          handleQuantityChange(index, text)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Subtotal</Text>
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={`$${product.subtotal.toFixed(2)}`}
                      editable={false}
                    />
                  </View>

                  {index < products.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addProduct}>
                <Text style={styles.addButtonText}>
                  + Agregar Otro Producto
                </Text>
              </TouchableOpacity>

              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Total a Pagar: ${calculateTotal().toFixed(2)}
                </Text>
              </View>

              {/* BOTONES PASO 2 */}
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={prevStep}>
                  <Text style={styles.cancelButtonText}>Anterior</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* PASO 3: MÉTODOS DE PAGO */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Métodos de Pago</Text>
              <Text style={styles.totalText}>
                Total: ${calculateTotal().toFixed(2)}
              </Text>

              {paymentMethods.map((method, index) => (
                <View key={method.id} style={styles.paymentContainer}>
                  {paymentMethods.length > 1 && (
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Método {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removePaymentMethod(index)}>
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Método de Pago *</Text>
                    <TouchableOpacity
                      style={styles.selectInput}
                      onPress={() => {
                        setActiveIndex(index);
                        setShowPaymentMethodPicker(true);
                      }}>
                      <Text
                        style={
                          method.metodo
                            ? styles.selectText
                            : styles.placeholderText
                        }>
                        {method.metodo || 'Selecciona método'}
                      </Text>
                      <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Moneda *</Text>
                    <TouchableOpacity
                      style={[
                        styles.selectInput,
                        !isCurrencySelectable(method.metodo) &&
                          styles.disabledInput,
                      ]}
                      onPress={() => {
                        if (isCurrencySelectable(method.metodo)) {
                          setActiveIndex(index);
                          setShowCurrencyPicker(true);
                        }
                      }}
                      disabled={!isCurrencySelectable(method.metodo)}>
                      <Text
                        style={
                          method.moneda
                            ? styles.selectText
                            : styles.placeholderText
                        }>
                        {method.moneda ||
                          (method.metodo
                            ? 'Bs (automático)'
                            : 'Selecciona moneda')}
                      </Text>
                      {isCurrencySelectable(method.metodo) && (
                        <Text style={styles.dropdownIcon}>▼</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Monto *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={method.monto}
                      onChangeText={(text) =>
                        handlePaymentAmountChange(index, text)
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      Referencia {isReferenceEnabled(method.metodo) ? '*' : ''}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        !isReferenceEnabled(method.metodo) &&
                          styles.disabledInput,
                      ]}
                      placeholder={
                        isReferenceEnabled(method.metodo)
                          ? 'Número de referencia'
                          : 'Solo para Pago Móvil/Transferencia'
                      }
                      value={method.referencia}
                      onChangeText={(text) =>
                        handleReferenceChange(index, text)
                      }
                      editable={isReferenceEnabled(method.metodo)}
                    />
                  </View>

                  {index < paymentMethods.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addButton}
                onPress={addPaymentMethod}>
                <Text style={styles.addButtonText}>
                  + Agregar Método de Pago
                </Text>
              </TouchableOpacity>

              <View style={styles.paymentSummary}>
                <Text style={styles.summaryText}>
                  Total Pagado: ${calculateTotalPaid().toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.summaryText,
                    calculateRemaining() <= 0
                      ? styles.successText
                      : styles.errorText,
                  ]}>
                  Monto Faltante: $
                  {Math.max(0, calculateRemaining()).toFixed(2)}
                </Text>
              </View>

              {/* BOTONES PASO 3 - PROPORCIONALES */}
              <View style={styles.finalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={prevStep}>
                  <Text style={styles.cancelButtonText}>Anterior</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    calculateRemaining() > 0 && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegisterSale}
                  disabled={calculateRemaining() > 0}>
                  <Text style={styles.registerButtonText}>Registrar Venta</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODALES */}
      <Modal
        visible={showProductPicker}
        transparent={true}
        animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowProductPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              {availableProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.modalOption}
                  onPress={() => {
                    handleProductSelect(activeIndex, product.name);
                    setShowProductPicker(false);
                  }}>
                  <Text style={styles.modalOptionText}>
                    {product.name} - ${product.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showPaymentMethodPicker}
        transparent={true}
        animationType="slide">
        <TouchableWithoutFeedback
          onPress={() => setShowPaymentMethodPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar Método</Text>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    handlePaymentMethodChange(activeIndex, option);
                    setShowPaymentMethodPicker(false);
                  }}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowCurrencyPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={styles.modalOption}
                  onPress={() => {
                    handleCurrencyChange(activeIndex, currency);
                    setShowCurrencyPicker(false);
                  }}>
                  <Text style={styles.modalOptionText}>{currency}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// ESTILOS COMPLETOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // ESTILOS PARA LISTA DE VENTAS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // BOTÓN PRINCIPAL CORREGIDO
  registerMainButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerMainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  salesList: {
    flex: 1,
  },
  saleItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saleId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  saleDate: {
    fontSize: 12,
    color: '#666',
  },
  saleDetails: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  saleProducts: {
    fontSize: 14,
    color: '#666',
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#d4edda',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // ESTILOS PARA FORMULARIO
  progressContainer: {
    marginBottom: 25,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activeStep: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepContent: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  selectInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: '#333',
    fontSize: 16,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  dropdownIcon: {
    color: '#666',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  productContainer: {
    marginBottom: 20,
  },
  paymentContainer: {
    marginBottom: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: '#f8fff9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#28a745',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  // BOTONES DE NAVEGACIÓN MEJORADOS
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // BOTONES FINALES PROPORCIONALES
  finalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default SalesManagementScreen;
