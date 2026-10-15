import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const cleanBom = (text) => text.replace(/^\uFEFF/, '');
const onlyLetters = (value) => value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');
const onlyNumbers = (value) => value.replace(/\D/g, '');
const getProfileImageUrl = (nextUser = {}) =>
  getImageUrl(nextUser.imgperfil || nextUser.imagen);

const getProfilePhotoMimeType = (file) => {
  if (file?.mimeType) {
    return file.mimeType;
  }

  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const appendProfilePhotoToFormData = async (formData, file) => {
  if (!file?.uri) {
    throw new Error('No se pudo leer la imagen seleccionada.');
  }

  const fileResponse = await fetch(file.uri);
  if (!fileResponse.ok) {
    throw new Error('No se pudo preparar la imagen seleccionada.');
  }

  const fileBlob = await fileResponse.blob();
  const extension = getProfilePhotoMimeType(file).split('/')[1] || 'jpg';
  const fileName = String(file.name || `perfil_${Date.now()}.${extension}`)
    .replace(/[^\w.\-]/g, '_');

  // Expo Go admite Blob, pero no el objeto { uri, name, type } de React Native.
  formData.append('imgperfil', fileBlob, fileName);
};

const readJson = async (response) => {
  const text = await response.text();
  const payload = text ? JSON.parse(cleanBom(text)) : {};

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'No se pudo completar la solicitud.');
  }

  return payload;
};

const getInitialForm = (user = {}) => ({
  cedula: String(user.cedula || ''),
  nombre: String(user.nombre || ''),
  apellido: String(user.apellido || ''),
  correo: String(user.correo || user.email || ''),
  telefono: String(user.telefono || ''),
  direccion: String(user.direccion || ''),
  fecha_nacimiento: String(user.fecha_nacimiento || ''),
});

const MiPerfilScreen = () => {
  const { token, user, updateUser } = useAuth();
  const [form, setForm] = useState(getInitialForm(user));
  const [profileImageUrl, setProfileImageUrl] = useState(getProfileImageUrl(user));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch(buildApiUrl('/usuarios/api_perfil'), {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await readJson(response);
        const nextUser = payload.user || {};

        if (active) {
          setForm(getInitialForm(nextUser));
          setProfileImageUrl(getProfileImageUrl(nextUser));
          await updateUser({ ...(user || {}), ...nextUser });
        }
      } catch (error) {
        if (active) {
          Alert.alert('Mi perfil', error.message || 'No se pudo cargar el perfil.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (field, value) => {
    const formatters = {
      nombre: (nextValue) => onlyLetters(nextValue).slice(0, 45),
      apellido: (nextValue) => onlyLetters(nextValue).slice(0, 45),
      telefono: (nextValue) => onlyNumbers(nextValue).slice(0, 15),
      correo: (nextValue) => nextValue.slice(0, 45),
      direccion: (nextValue) => nextValue.slice(0, 60),
    };

    setForm((current) => ({
      ...current,
      [field]: formatters[field] ? formatters[field](value) : value,
    }));
  };

  const validate = () => {
    if (form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (form.apellido.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) return 'El correo no tiene un formato válido.';
    if (form.telefono && !/^[0-9]{10,15}$/.test(form.telefono)) return 'El teléfono debe tener entre 10 y 15 números.';
    return null;
  };

  const handleSave = async () => {
    const message = validate();
    if (message) {
      Alert.alert('Revisa los datos', message);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(buildApiUrl('/usuarios/api_actualizar_perfil'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
        }),
      });
      const payload = await readJson(response);
      const nextUser = payload.user || { ...(user || {}), ...form };

      await updateUser({ ...(user || {}), ...nextUser });
      setForm(getInitialForm(nextUser));
      Alert.alert('Mi perfil', payload.message || 'Perfil actualizado correctamente.');
    } catch (error) {
      Alert.alert('Mi perfil', error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      await appendProfilePhotoToFormData(formData, asset);

      setUploadingPhoto(true);
      const response = await fetch(buildApiUrl('/usuarios/api_actualizar_foto_perfil'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const payload = await readJson(response);
      const nextUser = payload.user || {};

      await updateUser({ ...(user || {}), ...nextUser });
      setProfileImageUrl(getProfileImageUrl(nextUser));
      Alert.alert('Mi perfil', payload.message || 'Foto de perfil actualizada correctamente.');
    } catch (error) {
      Alert.alert('Mi perfil', error.message || 'No se pudo actualizar la foto de perfil.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const isValidPassword = (value) =>
    value.length >= 8
    && !/\s/.test(value)
    && /[A-Za-z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      Alert.alert('Cambiar contrasena', 'Completa todos los campos.');
      return;
    }
    if (!isValidPassword(passwords.next)) {
      Alert.alert('Cambiar contrasena', 'La nueva contrasena debe tener al menos 8 caracteres, letras, numeros y un simbolo.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      Alert.alert('Cambiar contrasena', 'La confirmacion no coincide con la nueva contrasena.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(buildApiUrl('/usuarios/api_cambiar_password'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.next,
          confirm_password: passwords.confirm,
        }),
      });
      const payload = await readJson(response);
      setPasswords({ current: '', next: '', confirm: '' });
      Alert.alert('Cambiar contrasena', payload.message || 'Contrasena actualizada correctamente.');
    } catch (error) {
      Alert.alert('Cambiar contrasena', error.message || 'No se pudo actualizar la contrasena.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#14532d" size="large" />
        <Text style={styles.centerText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mi perfil</Text>
        <Text style={styles.subtitle}>Consulta y actualiza tus datos personales.</Text>

        <View style={styles.card}>
          <View style={styles.photoSection}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <TouchableOpacity
              style={[styles.photoButton, uploadingPhoto && styles.buttonDisabled]}
              onPress={handleSelectPhoto}
              disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <ActivityIndicator color="#14532d" />
              ) : (
                <Text style={styles.photoButtonText}>Cambiar foto de perfil</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Cédula</Text>
          <TextInput style={[styles.input, styles.disabled]} value={form.cedula} editable={false} />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput style={[styles.input, styles.disabled]} value={form.fecha_nacimiento} editable={false} />

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={form.nombre} onChangeText={(value) => handleChange('nombre', value)} />

          <Text style={styles.label}>Apellido</Text>
          <TextInput style={styles.input} value={form.apellido} onChangeText={(value) => handleChange('apellido', value)} />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={form.telefono} onChangeText={(value) => handleChange('telefono', value)} keyboardType="number-pad" />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={styles.input} value={form.correo} onChangeText={(value) => handleChange('correo', value)} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Dirección</Text>
          <TextInput style={[styles.input, styles.textArea]} value={form.direccion} onChangeText={(value) => handleChange('direccion', value)} multiline />

          <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar cambios</Text>}
          </TouchableOpacity>

          <View style={styles.passwordSection}>
            <Text style={styles.passwordTitle}>Cambiar contrasena</Text>
            <Text style={styles.passwordHelp}>Minimo 8 caracteres con letras, numeros y un simbolo.</Text>

            <Text style={styles.label}>Contrasena actual</Text>
            <TextInput style={styles.input} value={passwords.current} onChangeText={(value) => setPasswords((current) => ({ ...current, current: value }))} secureTextEntry autoCapitalize="none" />

            <Text style={styles.label}>Nueva contrasena</Text>
            <TextInput style={styles.input} value={passwords.next} onChangeText={(value) => setPasswords((current) => ({ ...current, next: value }))} secureTextEntry autoCapitalize="none" />

            <Text style={styles.label}>Confirmar nueva contrasena</Text>
            <TextInput style={styles.input} value={passwords.confirm} onChangeText={(value) => setPasswords((current) => ({ ...current, confirm: value }))} secureTextEntry autoCapitalize="none" />

            <TouchableOpacity style={[styles.secondaryButton, changingPassword && styles.buttonDisabled]} onPress={handlePasswordChange} disabled={changingPassword}>
              {changingPassword ? <ActivityIndicator color="#14532d" /> : <Text style={styles.secondaryButtonText}>Actualizar contrasena</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f7f1' },
  content: { padding: 18, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f7f1' },
  centerText: { marginTop: 12, color: '#14532d' },
  title: { color: '#14532d', fontSize: 26, fontWeight: '800' },
  subtitle: { color: '#5f6f63', fontSize: 14, marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, elevation: 3 },
  photoSection: { alignItems: 'center', marginBottom: 22 },
  profileImage: { width: 132, height: 132, borderRadius: 66, borderWidth: 3, borderColor: '#d7e2d4', backgroundColor: '#edf2ec' },
  photoButton: { borderColor: '#14532d', borderRadius: 12, borderWidth: 1, marginTop: 12, paddingHorizontal: 16, paddingVertical: 10 },
  photoButtonText: { color: '#14532d', fontSize: 14, fontWeight: '800' },
  label: { color: '#24452d', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#f9fbf8', borderColor: '#d7e2d4', borderRadius: 12, borderWidth: 1, color: '#1f2937', fontSize: 15, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12 },
  disabled: { backgroundColor: '#edf2ec', color: '#6b7280' },
  textArea: { minHeight: 86, textAlignVertical: 'top' },
  button: { alignItems: 'center', backgroundColor: '#14532d', borderRadius: 14, marginTop: 8, paddingVertical: 15 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  passwordSection: { borderTopColor: '#d7e2d4', borderTopWidth: 1, marginTop: 24, paddingTop: 20 },
  passwordTitle: { color: '#14532d', fontSize: 19, fontWeight: '800', marginBottom: 6 },
  passwordHelp: { color: '#5f6f63', fontSize: 13, marginBottom: 16 },
  secondaryButton: { alignItems: 'center', borderColor: '#14532d', borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  secondaryButtonText: { color: '#14532d', fontSize: 15, fontWeight: '800' },
});

export default MiPerfilScreen;

