import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { buildApiUrl } from '../config/api';

const CODES = ['0412', '0422', '0416', '0426', '0414', '0424'];
const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const adultLimit = () => { const date = new Date(); date.setFullYear(date.getFullYear() - 18); return date; };
const ageOf = (date) => { const now = new Date(); let age = now.getFullYear() - date.getFullYear(); if (now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())) age--; return age; };
const validPassword = (value) => value.length >= 8 && !/\s/.test(value) && /[A-Za-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);

const ClientRegistrationScreen = ({ navigation }) => {
  const [form, setForm] = useState({ cedula: '', nombre: '', apellido: '', codigo: '0412', telefono: '', correo: '', direccion: '', password: '', confirm: '' });
  const [birthDate, setBirthDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const setField = (field, value) => {
    const clean = {
      cedula: (input) => input.replace(/\D/g, '').slice(0, 10),
      telefono: (input) => input.replace(/\D/g, '').slice(0, 7),
      nombre: (input) => input.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').slice(0, 45),
      apellido: (input) => input.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').slice(0, 45),
      correo: (input) => input.slice(0, 45),
      direccion: (input) => input.slice(0, 60),
    };
    setForm((current) => ({ ...current, [field]: clean[field] ? clean[field](value) : value }));
  };

  const validate = () => {
    if (!/^\d{7,10}$/.test(form.cedula)) return 'La cedula debe tener entre 7 y 10 digitos.';
    if (!birthDate || ageOf(birthDate) < 18) return 'Debes ser mayor de edad.';
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,45}$/.test(form.nombre.trim())) return 'El nombre solo admite letras, entre 2 y 45 caracteres.';
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,45}$/.test(form.apellido.trim())) return 'El apellido solo admite letras, entre 2 y 45 caracteres.';
    if (!/^\d{7}$/.test(form.telefono)) return 'Ingresa los 7 digitos restantes del telefono.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) return 'El correo no tiene un formato valido.';
    if (form.direccion.trim().length < 5) return 'La direccion debe tener entre 5 y 60 caracteres.';
    if (!validPassword(form.password)) return 'La contrasena requiere minimo 8 caracteres, letras, numeros y un simbolo.';
    if (form.password !== form.confirm) return 'Las contrasenas no coinciden.';
    if (!terms) return 'Debes aceptar los terminos y condiciones.';
    return null;
  };

  const register = async () => {
    const error = validate();
    if (error) return Alert.alert('Registro', error);
    setLoading(true);
    try {
      const body = new URLSearchParams({ cedula: form.cedula, fecha_nacimiento: formatDate(birthDate), nombre: form.nombre.trim(), apellido: form.apellido.trim(), telefono: `${form.codigo}${form.telefono}`, email: form.correo.trim(), direccion: form.direccion.trim(), password: form.password, confirm_pass: form.confirm });
      const response = await fetch(buildApiUrl('/auth/registrarUsuarioCliente'), { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: body.toString() });
      const text = await response.text();
      const data = text ? JSON.parse(text.replace(/^\uFEFF/, '')) : {};
      if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo crear la cuenta.');
      Alert.alert('Registro exitoso', 'Tu cuenta fue creada. Ya puedes iniciar sesion.', [{ text: 'Iniciar sesion', onPress: () => navigation.replace('Login') }]);
    } catch (error) { Alert.alert('Registro', error.message || 'No se pudo crear la cuenta.'); }
    finally { setLoading(false); }
  };

  const field = (label, name, props = {}) => <><Text style={styles.label}>{label} *</Text><TextInput style={[styles.input, props.multiline && styles.textArea]} value={form[name]} onChangeText={(value) => setField(name, value)} {...props} /></>;
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.title}>Registro de cliente</Text><Text style={styles.subtitle}>Completa todos los campos obligatorios.</Text><View style={styles.card}>
    <Text style={styles.section}>Informacion personal</Text>
    {field('Cedula', 'cedula', { keyboardType: 'number-pad', maxLength: 10 })}
    <Text style={styles.label}>Fecha de nacimiento *</Text><TouchableOpacity style={styles.dateButton} onPress={() => setShowCalendar(true)}><Text style={birthDate ? styles.dateText : styles.placeholder}>{birthDate ? formatDate(birthDate) : 'Selecciona la fecha'}</Text></TouchableOpacity>{birthDate && <Text style={styles.age}>Edad: {ageOf(birthDate)} anos</Text>}{showCalendar && <DateTimePicker value={birthDate || adultLimit()} mode="date" display="default" maximumDate={adultLimit()} onChange={(_, date) => { if (Platform.OS === 'android') setShowCalendar(false); if (date) setBirthDate(date); }} />}
    {field('Nombres', 'nombre', { autoCapitalize: 'words', maxLength: 45 })}{field('Apellidos', 'apellido', { autoCapitalize: 'words', maxLength: 45 })}
    <Text style={styles.label}>Telefono *</Text><View style={styles.codes}>{CODES.map((code) => <TouchableOpacity key={code} style={[styles.code, form.codigo === code && styles.codeActive]} onPress={() => setField('codigo', code)}><Text style={[styles.codeText, form.codigo === code && styles.codeTextActive]}>{code}</Text></TouchableOpacity>)}</View>{field('Numero de telefono', 'telefono', { keyboardType: 'number-pad', maxLength: 7, placeholder: '7 digitos' })}
    <Text style={styles.section}>Informacion de contacto</Text>{field('Correo electronico', 'correo', { keyboardType: 'email-address', autoCapitalize: 'none', maxLength: 45 })}{field('Direccion', 'direccion', { multiline: true, maxLength: 60 })}
    <Text style={styles.section}>Seguridad</Text><Text style={styles.help}>Minimo 8 caracteres, con letras, numeros y un simbolo.</Text>{field('Contrasena', 'password', { secureTextEntry: true, autoCapitalize: 'none' })}{field('Confirmar contrasena', 'confirm', { secureTextEntry: true, autoCapitalize: 'none' })}
    <TouchableOpacity style={styles.terms} onPress={() => setTerms((value) => !value)}><View style={[styles.checkbox, terms && styles.checkboxActive]}>{terms && <Text style={styles.check}>X</Text>}</View><Text style={styles.termsText}>Acepto los terminos y condiciones.</Text></TouchableOpacity>
    <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={register} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarme</Text>}</TouchableOpacity><TouchableOpacity onPress={() => navigation.replace('Login')}><Text style={styles.login}>Ya tengo una cuenta</Text></TouchableOpacity>
  </View></ScrollView></KeyboardAvoidingView>;
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f2f7f1' }, content: { padding: 18, paddingBottom: 36 }, title: { color: '#14532d', fontSize: 26, fontWeight: '800' }, subtitle: { color: '#5f6f63', marginBottom: 18, marginTop: 5 }, card: { backgroundColor: '#fff', borderRadius: 18, elevation: 3, padding: 18 }, section: { color: '#14532d', fontSize: 18, fontWeight: '800', marginBottom: 12, marginTop: 10 }, label: { color: '#24452d', fontSize: 14, fontWeight: '700', marginBottom: 7, marginTop: 4 }, input: { backgroundColor: '#f9fbf8', borderColor: '#d7e2d4', borderRadius: 12, borderWidth: 1, color: '#1f2937', fontSize: 15, marginBottom: 13, paddingHorizontal: 14, paddingVertical: 12 }, textArea: { minHeight: 82, textAlignVertical: 'top' }, dateButton: { backgroundColor: '#f9fbf8', borderColor: '#d7e2d4', borderRadius: 12, borderWidth: 1, marginBottom: 4, padding: 14 }, dateText: { color: '#1f2937' }, placeholder: { color: '#8a968d' }, age: { color: '#5f6f63', fontSize: 12, marginBottom: 10 }, codes: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 }, code: { borderColor: '#bfd1bf', borderRadius: 9, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 7 }, codeActive: { backgroundColor: '#14532d', borderColor: '#14532d' }, codeText: { color: '#14532d', fontSize: 13, fontWeight: '700' }, codeTextActive: { color: '#fff' }, help: { color: '#5f6f63', fontSize: 13, marginBottom: 10 }, terms: { alignItems: 'center', flexDirection: 'row', marginBottom: 18, marginTop: 3 }, checkbox: { alignItems: 'center', borderColor: '#14532d', borderRadius: 4, borderWidth: 1, height: 20, justifyContent: 'center', marginRight: 9, width: 20 }, checkboxActive: { backgroundColor: '#14532d' }, check: { color: '#fff', fontSize: 12, fontWeight: '800' }, termsText: { color: '#374151', flex: 1, fontSize: 13 }, button: { alignItems: 'center', backgroundColor: '#14532d', borderRadius: 14, paddingVertical: 15 }, disabled: { opacity: 0.7 }, buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' }, login: { color: '#14532d', fontSize: 14, fontWeight: '800', marginTop: 18, textAlign: 'center' } });
export default ClientRegistrationScreen;
