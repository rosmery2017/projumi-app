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
import { loginWithBackend } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const isValidCedula = (value) => {
    const normalizedValue = value.trim();
    const cedulaRegex = /^[0-9]{6,12}$/;
    return cedulaRegex.test(normalizedValue);
  };

  const handleLogin = async () => {
    if (!cedula || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidCedula(cedula)) {
      Alert.alert('Error', 'Por favor ingresa una cédula válida');
      return;
    }

    setIsLoading(true);

    try {
      const session = await loginWithBackend({ cedula, password });
      signIn(session);
      setCedula('');
      setPassword('');
      navigation.replace('Home');
    } catch (error) {
      console.log('Login fallido:', error);
      Alert.alert(
        'Error al iniciar sesion',
        error?.message || 'No se pudo autenticar contra el backend'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperar contrasena', 'Se esta trabajando en ello');
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(`Login con ${provider}`, 'Funcionalidad en desarrollo');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={styles.content}>
          <Header />
          <Form
            cedula={cedula}
            setCedula={setCedula}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleLogin={handleLogin}
            handleForgotPassword={handleForgotPassword}
            handleSocialLogin={handleSocialLogin}
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Header = () => (
  <View style={styles.header}>
    <Image
      source={{
        uri: 'https://groupforcetechnology.ct.ws/public/imgn/IMG_4976.PNG',
      }}
      style={styles.logo}
    />
    <Text style={styles.title}>Bienvenido</Text>
    <Text style={styles.subtitle}>Inicia sesion en tu cuenta</Text>
  </View>
);

const Form = ({
  cedula,
  setCedula,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  handleLogin,
  handleForgotPassword,
  handleSocialLogin,
  navigation,
}) => (
  <View style={styles.form}>
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Cédula</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu cédula"
        placeholderTextColor="#999"
        value={cedula}
        onChangeText={(value) => setCedula(value.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        textContentType="none"
        importantForAutofill="no"
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.label}>Contrasena</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Ingresa tu contrasena"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
    </View>

    <TouchableOpacity
      style={styles.forgotPassword}
      onPress={handleForgotPassword}>
      <Text style={styles.forgotPasswordText}>¿Olvidaste tu contrasena?</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
      onPress={handleLogin}
      disabled={isLoading}>
      {isLoading ? (
        <Text style={styles.loginButtonText}>Cargando...</Text>
      ) : (
        <Text style={styles.loginButtonText}>Iniciar Sesion</Text>
      )}
    </TouchableOpacity>

    <View style={styles.registerContainer}>
      <Text style={styles.registerText}>¿No tienes cuenta? </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerLink}>Registrate</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 1,
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
  inputContainer: {
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#006400',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default LoginScreen;
