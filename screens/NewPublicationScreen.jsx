import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', dark:'#1A1A1A', muted:'#888', inputBg:'#F8F8F8', border:'#E0E0E0', lightGreen:'#E8F5E9' };

const CATEGORIES = ['Toros','Vacas','Novillos','Vaquillonas','Terneros','Reproductores'];
const BREEDS = ['Aberdeen Angus','Hereford','Braford','Brangus','Limousin','Shorthorn','Simmental','Angus Colorado'];

export default function NewPublicationScreen({ navigation }) {
  const { user } = useAuth();
  const [step,       setStep]      = useState(1);
  const [photo,      setPhoto]     = useState(null);
  const [photoUrl,   setPhotoUrl]  = useState('');
  const [uploading,  setUploading] = useState(false);
  const [name,       setName]      = useState('');
  const [category,   setCat]       = useState('');
  const [breed,      setBreed]     = useState('');
  const [kyc,        setKyc]       = useState(false);
  const [weight,     setWeight]    = useState('');
  const [age,        setAge]       = useState('');
  const [price,      setPrice]     = useState('');
  const [location,   setLoc]       = useState('');
  const [desc,       setDesc]      = useState('');
  const [showBreeds, setShowBreeds]= useState(false);
  const [loading,    setLoading]   = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galeria para subir fotos');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await uploadImage(uri);
    } catch (e) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen: ' + e.message);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const fileName = `${user.id}_${Date.now()}.jpg`;
      const filePath = `publications/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteCharacters = atob(base64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('publications')
        .upload(filePath, byteArray, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('publications')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
      Alert.alert('Foto subida', 'La imagen se cargo correctamente');
    } catch (e) {
      Alert.alert('Error al subir foto', e.message);
      setPhoto(null);
    } finally {
      setUploading(false);
    }
  };

  const goStep2 = () => {
    if (!name || !category || !breed || !weight || !price || !location) {
      Alert.alert('Campos obligatorios', 'Completa nombre, categoria, raza, peso, precio y ubicacion');
      return;
    }
    setStep(2);
  };

  const publish = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('publications').insert({
        user_id:      user.id,
        name:         name.trim(),
        category:     category,
        breed:        breed,
        weight_kg:    parseInt(weight) || 0,
        age_months:   parseInt(age)    || 0,
        price_ars:    parseInt(price.replace(/\D/g, '')) || 0,
        location:     location.trim(),
        description:  desc.trim(),
        kyc_verified: kyc,
        photo_url:    photoUrl || null,
        status:       'active',
      });
      if (error) throw error;
      Alert.alert('Publicacion creada!', 'Tu animal fue publicado exitosamente', [
        { text: 'Ver mis publicaciones', onPress: () => navigation.replace('Publications') }
      ]);
    } catch (e) {
      Alert.alert('Error al publicar', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nueva Publicacion</Text>
          <Text style={s.headerSub}>Paso 1 de 2</Text>
        </View>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: '50%' }]} />
        <View style={[s.progressEmpty, { flex: 1 }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Text style={s.label}>Foto del animal</Text>
        <TouchableOpacity style={[s.photoBox, photo && s.photoBoxFilled]} onPress={pickImage} disabled={uploading}>
          {uploading ? (
            <View style={s.uploadingWrap}>
              <ActivityIndicator color={C.green} size="large" />
              <Text style={s.uploadingTxt}>Subiendo imagen...</Text>
            </View>
          ) : photo ? (
            <View style={s.photoPreviewWrap}>
              <Image source={{ uri: photo }} style={s.photoPreview} />
              <View style={s.photoOverlay}>
                <Text style={s.photoOverlayTxt}>Tocar para cambiar</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={s.photoIcon}>📷</Text>
              <Text style={s.photoTxt}>Tocar para agregar foto</Text>
              <Text style={s.photoSub}>JPG, PNG hasta 10 MB</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.label}>Nombre del animal *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: Toro Genesis IV" placeholderTextColor="#BBB" value={name} onChangeText={setName} />
        </View>

        <Text style={s.label}>Categoria *</Text>
        <View style={s.chipsWrap}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[s.chip, category === c && s.chipActive]} onPress={() => setCat(c)}>
              <Text style={[s.chipTxt, category === c && s.chipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Tipo de genetica *</Text>
        <TouchableOpacity style={s.selectBox} onPress={() => setShowBreeds(!showBreeds)}>
          <Text style={breed ? s.selectVal : s.selectPh}>{breed || 'Selecciona la raza / genetica'}</Text>
          <Text style={s.selectArrow}>{showBreeds ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showBreeds && (
          <View style={s.dropdown}>
            {BREEDS.map(b => (
              <TouchableOpacity key={b} style={s.dropdownItem} onPress={() => { setBreed(b); setShowBreeds(false); }}>
                <Text style={s.dropdownTxt}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={s.kycBox}>
          <Text style={s.kycLabel}>Verificacion KYC</Text>
          <TouchableOpacity style={[s.toggle, kyc && s.toggleOn]} onPress={() => setKyc(!kyc)}>
            <View style={[s.toggleThumb, kyc && s.toggleThumbOn]} />
          </TouchableOpacity>
          <Text style={s.kycStatus}>{kyc ? 'KYC verificado' : 'KYC no verificado'}</Text>
        </View>

        <View style={s.row2}>
          <View style={s.half}>
            <Text style={s.label}>Peso (kg) *</Text>
            <View style={s.inputWrap}>
              <TextInput style={s.input} placeholder="Ej: 450" placeholderTextColor="#BBB" keyboardType="numeric" value={weight} onChangeText={setWeight} />
            </View>
          </View>
          <View style={s.half}>
            <Text style={s.label}>Edad (meses) *</Text>
            <View style={s.inputWrap}>
              <TextInput style={s.input} placeholder="Ej: 36" placeholderTextColor="#BBB" keyboardType="numeric" value={age} onChangeText={setAge} />
            </View>
          </View>
        </View>

        <Text style={s.label}>Precio (ARS) *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: 1500000" placeholderTextColor="#BBB" keyboardType="numeric" value={price} onChangeText={setPrice} />
        </View>

        <Text style={s.label}>Ubicacion *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: Cordoba, Argentina" placeholderTextColor="#BBB" value={location} onChangeText={setLoc} />
        </View>

        <Text style={s.label}>Descripcion</Text>
        <View style={[s.inputWrap, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
          <TextInput style={[s.input, { height: 80 }]} placeholder="Conta mas sobre el animal..." placeholderTextColor="#BBB" multiline value={desc} onChangeText={setDesc} />
        </View>

        <TouchableOpacity style={s.nextBtn} onPress={goStep2} activeOpacity={0.85}>
          <Text style={s.nextBtnTxt}>Continuar → Historial Reproductivo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => setStep(1)}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nueva Publicacion</Text>
          <Text style={s.headerSub}>Paso 2 de 2</Text>
        </View>
      </View>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: '100%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.step2Title}>Historial Reproductivo</Text>
        <Text style={s.step2Sub}>Agrega los eventos del historial del animal (opcional)</Text>

        <TouchableOpacity style={s.addEventBtn} onPress={() => Alert.alert('Proximamente', 'Disponible en la siguiente version')}>
          <Text style={s.addEventTxt}>+ Agregar evento reproductivo</Text>
        </TouchableOpacity>

        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>RESUMEN DE PUBLICACION</Text>
          {photo && (
            <View style={s.summaryPhotoWrap}>
              <Image source={{ uri: photo }} style={s.summaryPhoto} />
            </View>
          )}
          {[
            ['Animal',    name],
            ['Genetica',  breed],
            ['Categoria', category],
            ['Peso',      weight   ? weight + ' kg'    : '—'],
            ['Edad',      age      ? age    + ' meses' : '—'],
            ['Precio',    price    ? '$' + price       : '—'],
            ['KYC',       kyc      ? 'Verificado'      : 'No verificado'],
            ['Ubicacion', location],
            ['Foto',      photoUrl ? 'Cargada' : 'Sin foto'],
          ].map(([label, val]) => (
            <View key={label} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={[s.summaryVal, label === 'Foto' && photoUrl && { color: C.green }]}>{val || '—'}</Text>
            </View>
          ))}
        </View>

        <View style={s.step2Btns}>
          <TouchableOpacity style={s.backStep} onPress={() => setStep(1)}>
            <Text style={s.backStepTxt}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.publishBtn, loading && { opacity: 0.7 }]} onPress={publish} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.publishBtnTxt}>Publicar</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelBtnTxt}>Cancelar publicacion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.white },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:          { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  backIcon:         { fontSize: 22, color: C.dark, fontWeight: '300' },
  headerCenter:     { flex: 1 },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: C.dark },
  headerSub:        { fontSize: 12, color: C.muted, marginTop: 1 },
  progressBar:      { flexDirection: 'row', height: 4, backgroundColor: '#E0E0E0' },
  progressFill:     { height: 4, backgroundColor: C.green },
  progressEmpty:    { height: 4, backgroundColor: '#E0E0E0' },
  scroll:           { padding: 20, paddingBottom: 60 },
  label:            { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 8, marginTop: 4 },
  inputWrap:        { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 50, justifyContent: 'center', backgroundColor: C.inputBg, marginBottom: 4 },
  input:            { fontSize: 15, color: C.dark },
  photoBox:         { borderWidth: 2, borderColor: C.green, borderStyle: 'dashed', borderRadius: 14, backgroundColor: C.lightGreen, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 6, overflow: 'hidden' },
  photoBoxFilled:   { borderStyle: 'solid', padding: 0 },
  photoIcon:        { fontSize: 36, color: C.green },
  photoTxt:         { fontSize: 14, color: C.green, fontWeight: '600' },
  photoSub:         { fontSize: 11, color: C.muted },
  uploadingWrap:    { alignItems: 'center', gap: 10 },
  uploadingTxt:     { fontSize: 13, color: C.green, fontWeight: '500' },
  photoPreviewWrap: { width: '100%', height: '100%', position: 'relative' },
  photoPreview:     { width: '100%', height: '100%', borderRadius: 12 },
  photoOverlay:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, alignItems: 'center' },
  photoOverlayTxt:  { color: C.white, fontSize: 12, fontWeight: '600' },
  chipsWrap:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:             { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: C.white },
  chipActive:       { backgroundColor: C.bg, borderColor: C.bg },
  chipTxt:          { fontSize: 13, color: C.dark },
  chipTxtActive:    { color: C.white },
  selectBox:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, height: 50, backgroundColor: C.inputBg, marginBottom: 4 },
  selectVal:        { fontSize: 15, color: C.dark },
  selectPh:         { fontSize: 15, color: '#BBB' },
  selectArrow:      { fontSize: 12, color: C.muted },
  dropdown:         { borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: C.white, marginBottom: 8, overflow: 'hidden' },
  dropdownItem:     { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownTxt:      { fontSize: 14, color: C.dark },
  kycBox:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.lightGreen, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#C8E6C9' },
  kycLabel:         { fontSize: 13, fontWeight: '600', color: C.dark },
  toggle:           { width: 44, height: 24, borderRadius: 12, backgroundColor: '#CCC', justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn:         { backgroundColor: C.green },
  toggleThumb:      { width: 20, height: 20, borderRadius: 10, backgroundColor: C.white, elevation: 2 },
  toggleThumbOn:    { alignSelf: 'flex-end' },
  kycStatus:        { fontSize: 12, color: C.muted, flex: 1 },
  row2:             { flexDirection: 'row', gap: 12 },
  half:             { flex: 1 },
  nextBtn:          { backgroundColor: C.green, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  nextBtnTxt:       { color: C.white, fontSize: 15, fontWeight: '700' },
  step2Title:       { fontSize: 20, fontWeight: '700', color: C.dark, marginBottom: 6 },
  step2Sub:         { fontSize: 14, color: C.muted, marginBottom: 20 },
  addEventBtn:      { borderWidth: 2, borderColor: C.green, borderStyle: 'dashed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  addEventTxt:      { fontSize: 15, color: C.green, fontWeight: '600' },
  summaryCard:      { backgroundColor: C.lightGreen, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#C8E6C9' },
  summaryTitle:     { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1, marginBottom: 12 },
  summaryPhotoWrap: { borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  summaryPhoto:     { width: '100%', height: 120, borderRadius: 10 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  summaryLabel:     { fontSize: 13, color: C.muted },
  summaryVal:       { fontSize: 13, color: C.dark, fontWeight: '600' },
  step2Btns:        { flexDirection: 'row', gap: 12, marginBottom: 12 },
  backStep:         { flex: 1, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  backStepTxt:      { fontSize: 15, color: C.dark, fontWeight: '500' },
  publishBtn:       { flex: 2, height: 52, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  publishBtnTxt:    { fontSize: 15, color: C.white, fontWeight: '700' },
  cancelBtn:        { height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#FFCCCC', backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center' },
  cancelBtnTxt:     { fontSize: 14, color: '#E53935', fontWeight: '500' },
});