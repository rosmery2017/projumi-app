import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './components/LoginScreen';
import PerfilScreen from './components/PerfilScreen';
import HomeScreen from './components/HomeScreen';
import ProductosScreen from './components/ProductosScreen';
import EnviosScreen from './components/EnviosScreen';
import EventosScreen from './components/EventosScreen';
import RegisterScreen from './components/RegisterScreen';
import SettingsScreen from './components/SettingsScreen';
import PedidosScreen from './components/PedidosScreen';
import PagosScreen from './components/PagosScreen';
import CustomVentasButton from './components/OperacionesScreen';
import CarritoScreen from './components/CarritoScreen';
import CheckoutScreen from './components/CheckoutScreen';
import SalesManagementScreen from './components/SalesManagementScreen';
import { AuthProvider } from './context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#14532d' },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#14532d',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Productos') iconName = 'storefront';
          else if (route.name === 'Ventas Presencial') iconName = 'bag';
          else if (route.name === 'Eventos') iconName = 'calendar';
          else if (route.name === 'Perfil') iconName = 'person';
          else if (route.name === 'Ventas') iconName = 'bag';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Productos" component={ProductosScreen} />
      <Tab.Screen
        name="Ventas"
        component={HomeScreen}
        options={{
          tabBarButton: (props) => <CustomVentasButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CarritoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#14532d" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: '#14532d' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: true, title: 'Registro' }}
          />
          <Stack.Screen
            name="Ventas Presencial"
            component={SalesManagementScreen}
            options={{ headerShown: true, title: 'Ventas Presenciales' }}
          />
          <Stack.Screen
            name="Eventos"
            component={EventosScreen}
            options={{ headerShown: true, title: 'Ventas por Eventos' }}
          />
          <Stack.Screen name="Home" component={MainTabs} />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ headerShown: true, title: 'Compra' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: true, title: 'ConfiguraciÃ³n' }}
          />
          <Stack.Screen
            name="Pedidos"
            component={PedidosScreen}
            options={{ headerShown: true, title: 'Mis Pedidos' }}
          />
          <Stack.Screen
            name="Envios"
            component={EnviosScreen}
            options={{ headerShown: true, title: 'Mis Envios' }}
          />
          <Stack.Screen
            name="Pagos"
            component={PagosScreen}
            options={{ headerShown: true, title: 'Mis Pagos' }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
