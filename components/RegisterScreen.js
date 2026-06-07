import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const isAdult = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return age >= 18;
  };

  const handleRegister = async () => {
    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!isValidPassword(formData.password)) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.telefono && !isValidPhone(formData.telefono)) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
      return;
    }

    if (formData.fechaNacimiento && !isAdult(formData.fechaNacimiento)) {
      Alert.alert('Error', 'Debes ser mayor de 18 años para registrarte');
      return;
    }

    if (!terminosAceptados) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        '¡Registro Exitoso!',
        `Bienvenido ${formData.nombre} ${formData.apellido}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 3000);
  };

  const goToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled">
        {Platform.OS === 'web' ? (
          <View style={styles.content}>
            <Header />
            <Form
              formData={formData}
              handleInputChange={handleInputChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              terminosAceptados={terminosAceptados}
              setTerminosAceptados={setTerminosAceptados}
              isLoading={isLoading}
              handleRegister={handleRegister}
              goToLogin={goToLogin}
            />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}>
            <View style={styles.content}>
              <Header />
              <Form
                formData={formData}
                handleInputChange={handleInputChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                terminosAceptados={terminosAceptados}
                setTerminosAceptados={setTerminosAceptados}
                isLoading={isLoading}
                handleRegister={handleRegister}
                goToLogin={goToLogin}
              />
            </View>
          </KeyboardAvoidingView>
        )}
      </ScrollView>
    </View>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Image
      source={{
        uri: 'https://via.placeholder.com/100x100/28a745/ffffff?text=REG',
      }}
      style={styles.logo}
    />
    <Text style={styles.title}>Crear Cuenta</Text>
    <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
  </View>
);

const Form = ({
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  terminosAceptados,
  setTerminosAceptados,
  isLoading,
  handleRegister,
  goToLogin,
}) => (
  <View style={styles.form}>
    <View style={styles.row}>
      <View style={[styles.inputContainer, styles.halfInput]}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#999"
          value={formData.nombre}
          onChangeText={(text) => handleInputChange('nombre', text)}
          autoCapitalize="words"
        />
      </View>

      <View style={[styles.inputContainer, styles.halfInput]}>
        <Text style={styles.label}>Apellido *</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu apellido"
          placeholderTextColor="#999"
          value={formData.apellido}
          onChangeText={(text) => handleInputChange('apellido', text)}
          autoCapitalize="words"
        />
      </View>
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="tu@email.com"
        placeholderTextColor="#999"
        value={formData.email}
        onChangeText={(text) => handleInputChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="+1 234 567 8900"
        placeholderTextColor="#999"
        value={formData.telefono}
        onChangeText={(text) => handleInputChange('telefono', text)}
        keyboardType="phone-pad"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Fecha de Nacimiento</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        value={formData.fechaNacimiento}
        onChangeText={(text) => handleInputChange('fechaNacimiento', text)}
        keyboardType="numbers-and-punctuation"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Contraseña *</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#999"
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Confirmar Contraseña *</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Repite tu contraseña"
          placeholderTextColor="#999"
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Text style={styles.eyeText}>
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    <TouchableOpacity
      style={styles.termsContainer}
      onPress={() => setTerminosAceptados(!terminosAceptados)}>
      <View style={styles.checkbox}>
        {terminosAceptados && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.termsText}>
        Acepto los <Text style={styles.termsLink}>términos y condiciones</Text>{' '}
        y la <Text style={styles.termsLink}>política de privacidad</Text>
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.registerButton,
        isLoading && styles.registerButtonDisabled,
      ]}
      onPress={handleRegister}
      disabled={isLoading}>
      {isLoading ? (
        <Text style={styles.registerButtonText}>Creando Cuenta...</Text>
      ) : (
        <Text style={styles.registerButtonText}>Crear Cuenta</Text>
      )}
    </TouchableOpacity>

    <View style={styles.loginContainer}>
      <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
      <TouchableOpacity onPress={goToLogin}>
        <Text style={styles.loginLink}>Inicia Sesión</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : height,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfInput: {
    flex: 0.48,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  eyeText: {
    fontSize: 18,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    padding: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007bff',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#006400',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default RegisterScreen;
