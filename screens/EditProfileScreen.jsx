import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', red:'#E53935', inputBg:'#F5F5F5' };

export default function EditProfileScreen({ navigation }) {
  const { profile, user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name  || '');
  const [phone,    setPhone]    = useState(profile?.phone      || '');
  const [location, setLocation] = useState(profile?.location   || '');
  const [loading,  setLoading]  = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacio');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone:     phone.trim(),
        location:  location.trim(),
      });
      Alert.alert('Perfil actualizado', 'Tus datos fueron guardados correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error al guardar', e.message);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.full_name || 'Usuario';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header — mismo estilo que ProfileScreen */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Editar Perfil</Text>
        </View>

        {/* Avatar — mismo que ProfileScreen */}
        <View style={s.profileSection}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.name}>{displayName}</Text>
            <Text style={s.role}>{user?.email || '—'}</Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={s.formCard}>
          <Text style={s.formTitle}>Informacion Personal</Text>

          {/* Nombre */}
          <View style={s.fieldWrap}>
            <View style={s.fieldIcon}><Text style={s.fieldIconTxt}>👤</Text></View>
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Nombre completo *</Text>
              <TextInput
                style={s.fieldInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                placeholderTextColor={C.gray}
              />
            </View>
          </View>

          <View style={s.divider} />

          {/* Email — solo lectura */}
          <View style={s.fieldWrap}>
            <View style={s.fieldIcon}><Text style={s.fieldIconTxt}>✉️</Text></View>
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Correo electronico</Text>
              <Text style={s.fieldReadOnly}>{user?.email || '—'}</Text>
              <Text style={s.fieldHint}>El email no se puede modificar</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Telefono */}
          <View style={s.fieldWrap}>
            <View style={s.fieldIcon}><Text style={s.fieldIconTxt}>📞</Text></View>
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Telefono</Text>
              <TextInput
                style={s.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+54 9 11 1234-5678"
                placeholderTextColor={C.gray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={s.divider} />

          {/* Ubicacion */}
          <View style={s.fieldWrap}>
            <View style={s.fieldIcon}><Text style={s.fieldIconTxt}>📍</Text></View>
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Ubicacion</Text>
              <TextInput
                style={s.fieldInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Ej: Buenos Aires, Argentina"
                placeholderTextColor={C.gray}
              />
            </View>
          </View>

          <View style={s.divider} />

          {/* Miembro desde — solo lectura */}
          <View style={s.fieldWrap}>
            <View style={s.fieldIcon}><Text style={s.fieldIconTxt}>📅</Text></View>
            <View style={s.fieldBody}>
              <Text style={s.fieldLabel}>Miembro desde</Text>
              <Text style={s.fieldReadOnly}>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' })
                  : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Boton guardar */}
        <TouchableOpacity
          style={[s.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={s.saveBtnTxt}>Guardar Cambios</Text>
          }
        </TouchableOpacity>

        {/* Boton cancelar */}
        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelBtnTxt}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#F5F7F5' },
  scroll:        { paddingBottom: 100 },
  header:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, gap: 12 },
  backBtn:       { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:      { fontSize: 22, color: C.white, fontWeight: '300' },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: C.white },
  profileSection:{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  avatar:        { width: 64, height: 64, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:  { fontSize: 28, fontWeight: '700', color: C.white },
  profileInfo:   { flex: 1 },
  name:          { fontSize: 20, fontWeight: '700', color: C.white },
  role:          { fontSize: 12, color: C.muted, marginTop: 4 },
  formCard:      { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, elevation: 2 },
  formTitle:     { fontSize: 16, fontWeight: '700', color: C.dark, marginBottom: 14 },
  fieldWrap:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  fieldIcon:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0F7F0', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  fieldIconTxt:  { fontSize: 18 },
  fieldBody:     { flex: 1 },
  fieldLabel:    { fontSize: 11, color: C.gray, marginBottom: 4 },
  fieldInput:    { fontSize: 14, color: C.dark, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 4, paddingTop: 0 },
  fieldReadOnly: { fontSize: 14, color: C.dark, fontWeight: '500' },
  fieldHint:     { fontSize: 10, color: C.gray, marginTop: 4, fontStyle: 'italic' },
  divider:       { height: 1, backgroundColor: '#F5F5F5' },
  saveBtn:       { marginHorizontal: 16, marginTop: 20, backgroundColor: C.green, borderRadius: 16, padding: 16, alignItems: 'center' },
  saveBtnTxt:    { fontSize: 15, color: C.white, fontWeight: '700' },
  cancelBtn:     { marginHorizontal: 16, marginTop: 10, backgroundColor: C.white, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cancelBtnTxt:  { fontSize: 15, color: C.gray, fontWeight: '500' },
});