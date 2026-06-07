import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CustomVentasButton(props) {
  const [open, setOpen] = useState(false);
  const nav = useNavigation();

  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    setOpen(!open);
    Animated.parallel([
      Animated.spring(anim1, { toValue: open ? 0 : 1, useNativeDriver: true }),
      Animated.spring(anim2, { toValue: open ? 0 : 1, useNativeDriver: true }),
    ]).start();
  };

  return (
    <>
      <View
        style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
        pointerEvents="box-none">
        {/* Botón Tab personalizado */}
        <TouchableOpacity
          {...props}
          onPress={toggleMenu}
          style={{ alignItems: 'center' }}>
          <Ionicons name="bag" size={26} color={open ? '#14532d' : '#888'} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '60',
              color: open ? '#14532d' : '#888',
              marginTop: 2,
            }}>
            Ventas
          </Text>
        </TouchableOpacity>

        {/* Burbuja Evento */}
        {open && (
          <Animated.View
            style={[
              styles.bubble,
              {
                transform: [
                  { scale: anim1 },
                  {
                    translateX: anim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 60],
                    }),
                  },
                ],
              },
            ]}>
            <TouchableOpacity
              style={styles.bubbleBtn}
              onPress={() => {
                toggleMenu();
                nav.navigate('Eventos');
              }}>
              <Ionicons name="radio-outline" size={40} color="#14532d" />
              <Text style={styles.bubbleText}>Ventas Por Eventos</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Burbuja Presencial */}
        {open && (
          <Animated.View
            style={[
              styles.bubble,
              {
                transform: [
                  { scale: anim2 },
                  {
                    translateX: anim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -60],
                    }),
                  },
                ],
              },
            ]}>
            <TouchableOpacity
              style={styles.bubbleBtn}
              onPress={() => {
                toggleMenu();
                nav.navigate('Ventas Presencial');
              }}>
              <Ionicons name="location-outline" size={40} color="#14532d" />
              <Text style={styles.bubbleText}>Ventas Presencial</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 60,
    right: -10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 8,
  },
  bubbleBtn: {
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  bubbleText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
    color: '#555',
  },
});
