import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert } from 'react-native';

// ¡Nuevas importaciones para Supabase y Autenticación!
import { supabase } from '../supabase'; // <-- Asegúrate de que esta ruta sea la correcta para tu proyecto
import { useAuth } from '../context/AuthContext';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', dark:'#1A1A1A', muted:'#888', inputBg:'#F8F8F8', border:'#E0E0E0', lightGreen:'#E8F5E9' };

const CATEGORIES = ['Toros','Vacas','Novillos','Vaquillonas','Terneros','Reproductores'];
const BREEDS = ['Aberdeen Angus','Hereford','Braford','Brangus','Limousin','Shorthorn','Simmental','Angus Colorado'];

export default function NewPublicationScreen({ navigation }) {
  const { user } = useAuth(); // <- Obtenemos al usuario logueado
  const [step, setStep] = useState(1);

  // Paso 1
  const [photo, setPhoto]     = useState(null);
  const [name, setName]       = useState('');
  const [category, setCat]    = useState('');
  const [breed, setBreed]     = useState('');
  const [kyc, setKyc]         = useState(false);
  const [weight, setWeight]   = useState('');
  const [age, setAge]         = useState('');
  const [price, setPrice]     = useState('');
  const [location, setLoc]    = useState('');
  const [desc, setDesc]       = useState('');

  // Paso 2
  const [events, setEvents]   = useState([]);
  const [showBreeds, setShowBreeds] = useState(false);

  const goStep2 = () => {
    if (!name || !category || !breed || !weight || !price || !location) {
      Alert.alert('Campos obligatorios','Completá nombre, categoría, raza, peso, precio y ubicación');
      return;
    }
    setStep(2);
  };

  // Función real para publicar en Supabase
  const publish = async () => {
    // 1. Verificamos que tengamos un usuario logueado
    if (!user || !user.id) {
      Alert.alert('Error', 'Debes iniciar sesión para publicar');
      return;
    }

    // 2. Armamos el objeto respetando los tipos de datos de tu SQL (usando parseInt para los números)
    const nuevaPublicacion = {
      user_id: user.id, // Viene del AuthContext
      name: name,
      category: category,
      breed: breed,
      weight_kg: parseInt(weight) || 0, // Convertido a número entero
      age_months: parseInt(age) || 0,   // Convertido a número entero
      price_ars: parseInt(price) || 0,  // Convertido a número entero
      location: location,
      description: desc,
      kyc_verified: kyc,
      // photo_url: null -> Listo para cuando agregues subida de imágenes
    };

    try {
      // 3. Intentamos insertar en Supabase
      const { data, error } = await supabase
        .from('publications')
        .insert([nuevaPublicacion]);

      if (error) {
        console.error("❌ Error de Supabase:", error);
        Alert.alert('Error al publicar', error.message);
        return;
      }

      // 4. Éxito
      console.log("✅ Publicación exitosa");
      Alert.alert('¡Publicación creada!','Tu animal fue publicado exitosamente 🎉', [
        { text:'Ver mis publicaciones', onPress:()=>navigation.replace('Publications') }
      ]);

    } catch (err) {
      console.error("❌ Error inesperado:", err);
      Alert.alert('Error inesperado', 'Revisa la consola para más detalles.');
    }
  };

  if (step === 1) return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nueva Publicación</Text>
          <Text style={s.headerSub}>Paso 1 de 2</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={s.progressBar}>
        <View style={[s.progressFill,{width:'50%'}]}/>
        <View style={[s.progressEmpty,{flex:1}]}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Foto */}
        <Text style={s.label}>Foto del animal</Text>
        <TouchableOpacity style={s.photoBox}>
          <Text style={s.photoIcon}>🖼️</Text>
          <Text style={s.photoTxt}>Tocar para agregar foto</Text>
          <Text style={s.photoSub}>JPG, PNG hasta 10 MB</Text>
        </TouchableOpacity>

        {/* Nombre */}
        <Text style={s.label}>Nombre del animal *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: Toro Génesis IV" placeholderTextColor="#BBB" value={name} onChangeText={setName}/>
        </View>

        {/* Categoría */}
        <Text style={s.label}>Categoría *</Text>
        <View style={s.chipsWrap}>
          {CATEGORIES.map(c=>(
            <TouchableOpacity key={c} style={[s.chip, category===c && s.chipActive]} onPress={()=>setCat(c)}>
              <Text style={[s.chipTxt, category===c && s.chipTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Raza */}
        <Text style={s.label}>Tipo de genética *</Text>
        <TouchableOpacity style={s.selectBox} onPress={()=>setShowBreeds(!showBreeds)}>
          <Text style={breed?s.selectVal:s.selectPh}>{breed||'Seleccioná la raza / genética'}</Text>
          <Text style={s.selectArrow}>{showBreeds?'▲':'▼'}</Text>
        </TouchableOpacity>
        {showBreeds && (
          <View style={s.dropdown}>
            {BREEDS.map(b=>(
              <TouchableOpacity key={b} style={s.dropdownItem} onPress={()=>{setBreed(b);setShowBreeds(false);}}>
                <Text style={s.dropdownTxt}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* KYC */}
        <View style={s.kycBox}>
          <Text style={s.kycLabel}>Verificación KYC</Text>
          <TouchableOpacity style={[s.toggle, kyc&&s.toggleOn]} onPress={()=>setKyc(!kyc)}>
            <View style={[s.toggleThumb, kyc&&s.toggleThumbOn]}/>
          </TouchableOpacity>
          <Text style={s.kycStatus}>{kyc?'KYC verificado ✅':'KYC no verificado'}</Text>
        </View>

        {/* Peso y Edad */}
        <View style={s.row2}>
          <View style={s.half}>
            <Text style={s.label}>Peso (kg) *</Text>
            <View style={s.inputWrap}>
              <TextInput style={s.input} placeholder="Ej: 450" placeholderTextColor="#BBB" keyboardType="numeric" value={weight} onChangeText={setWeight}/>
            </View>
          </View>
          <View style={s.half}>
            <Text style={s.label}>Edad (meses) *</Text>
            <View style={s.inputWrap}>
              <TextInput style={s.input} placeholder="Ej: 36" placeholderTextColor="#BBB" keyboardType="numeric" value={age} onChangeText={setAge}/>
            </View>
          </View>
        </View>

        {/* Precio */}
        <Text style={s.label}>Precio (ARS) *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: $1.500.000" placeholderTextColor="#BBB" keyboardType="numeric" value={price} onChangeText={setPrice}/>
        </View>

        {/* Ubicación */}
        <Text style={s.label}>Ubicación *</Text>
        <View style={s.inputWrap}>
          <TextInput style={s.input} placeholder="Ej: Córdoba, Argentina" placeholderTextColor="#BBB" value={location} onChangeText={setLoc}/>
        </View>

        {/* Descripción */}
        <Text style={s.label}>Descripción</Text>
        <View style={[s.inputWrap,{height:100,alignItems:'flex-start',paddingTop:12}]}>
          <TextInput style={[s.input,{height:80}]} placeholder="Contá más sobre el animal: condición corporal, documentación, detalles del lote..." placeholderTextColor="#BBB" multiline value={desc} onChangeText={setDesc}/>
        </View>

        <TouchableOpacity style={s.nextBtn} onPress={goStep2} activeOpacity={0.85}>
          <Text style={s.nextBtnTxt}>Continuar → Historial Reproductivo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── PASO 2 ───────────────────────────────────────────────
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={()=>setStep(1)}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nueva Publicación</Text>
          <Text style={s.headerSub}>Paso 2 de 2</Text>
        </View>
      </View>

      <View style={s.progressBar}>
        <View style={[s.progressFill,{width:'100%'}]}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.step2Title}>Historial Reproductivo</Text>
        <Text style={s.step2Sub}>Agregá los eventos del historial del animal (opcional)</Text>

        <TouchableOpacity style={s.addEventBtn} onPress={()=>Alert.alert('Próximamente','Esta función estará disponible en la siguiente versión')}>
          <Text style={s.addEventTxt}>+ Agregar evento reproductivo</Text>
        </TouchableOpacity>

        {/* Resumen */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>RESUMEN DE PUBLICACIÓN</Text>
          {[
            ['Animal', name],
            ['Genética', breed],
            ['Categoría', category],
            ['Peso', weight ? weight+' kg' : '—'],
            ['Edad', age ? age+' meses' : '—'],
            ['Precio', price ? '$'+price : '—'],
            ['KYC', kyc ? '✅ Verificado' : '❌ No verificado'],
            ['Historial', events.length+' eventos'],
          ].map(([label,val])=>(
            <View key={label} style={s.summaryRow}>
              <Text style={s.summaryLabel}>{label}</Text>
              <Text style={s.summaryVal}>{val||'—'}</Text>
            </View>
          ))}
        </View>

        <View style={s.step2Btns}>
          <TouchableOpacity style={s.backStep} onPress={()=>setStep(1)}>
            <Text style={s.backStepTxt}>← Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.publishBtn} onPress={publish} activeOpacity={0.85}>
            <Text style={s.publishBtnTxt}>📤 Publicar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.cancelBtn} onPress={()=>navigation.goBack()}>
          <Text style={s.cancelBtnTxt}>Cancelar publicación</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.white},
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:52,paddingBottom:12,gap:12,backgroundColor:C.white,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  backBtn:{width:36,height:36,borderRadius:12,backgroundColor:'#F0F0F0',alignItems:'center',justifyContent:'center'},
  backIcon:{fontSize:22,color:C.dark,fontWeight:'300'},
  headerCenter:{flex:1},
  headerTitle:{fontSize:18,fontWeight:'700',color:C.dark},
  headerSub:{fontSize:12,color:C.muted,marginTop:1},
  progressBar:{flexDirection:'row',height:4,backgroundColor:'#E0E0E0'},
  progressFill:{height:4,backgroundColor:C.green},
  progressEmpty:{height:4,backgroundColor:'#E0E0E0'},
  scroll:{padding:20,paddingBottom:60},
  label:{fontSize:13,fontWeight:'600',color:C.dark,marginBottom:8,marginTop:4},
  inputWrap:{borderWidth:1,borderColor:C.border,borderRadius:12,paddingHorizontal:14,height:50,justifyContent:'center',backgroundColor:C.inputBg,marginBottom:4},
  input:{fontSize:15,color:C.dark},
  photoBox:{borderWidth:2,borderColor:C.green,borderStyle:'dashed',borderRadius:14,backgroundColor:C.lightGreen,height:110,alignItems:'center',justifyContent:'center',marginBottom:16,gap:6},
  photoIcon:{fontSize:32,color:C.green},
  photoTxt:{fontSize:14,color:C.green,fontWeight:'600'},
  photoSub:{fontSize:11,color:C.muted},
  chipsWrap:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:'#DDD',backgroundColor:C.white},
  chipActive:{backgroundColor:C.bg,borderColor:C.bg},
  chipTxt:{fontSize:13,color:C.dark},
  chipTxtActive:{color:C.white},
  selectBox:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:C.border,borderRadius:12,paddingHorizontal:14,height:50,backgroundColor:C.inputBg,marginBottom:4},
  selectVal:{fontSize:15,color:C.dark},
  selectPh:{fontSize:15,color:'#BBB'},
  selectArrow:{fontSize:12,color:C.muted},
  dropdown:{borderWidth:1,borderColor:C.border,borderRadius:12,backgroundColor:C.white,marginBottom:8,overflow:'hidden'},
  dropdownItem:{paddingHorizontal:16,paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#F5F5F5'},
  dropdownTxt:{fontSize:14,color:C.dark},
  kycBox:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.lightGreen,borderRadius:12,padding:14,marginBottom:16,borderWidth:1,borderColor:'#C8E6C9'},
  kycLabel:{fontSize:13,fontWeight:'600',color:C.dark},
  toggle:{width:44,height:24,borderRadius:12,backgroundColor:'#CCC',justifyContent:'center',paddingHorizontal:2},
  toggleOn:{backgroundColor:C.green},
  toggleThumb:{width:20,height:20,borderRadius:10,backgroundColor:C.white,shadowColor:'#000',shadowOpacity:0.2,shadowRadius:2,elevation:2},
  toggleThumbOn:{alignSelf:'flex-end'},
  kycStatus:{fontSize:12,color:C.muted,flex:1},
  row2:{flexDirection:'row',gap:12},
  half:{flex:1},
  nextBtn:{backgroundColor:C.green,borderRadius:14,height:52,alignItems:'center',justifyContent:'center',marginTop:16},
  nextBtnTxt:{color:C.white,fontSize:15,fontWeight:'700'},
  step2Title:{fontSize:20,fontWeight:'700',color:C.dark,marginBottom:6},
  step2Sub:{fontSize:14,color:C.muted,marginBottom:20},
  addEventBtn:{borderWidth:2,borderColor:C.green,borderStyle:'dashed',borderRadius:14,height:52,alignItems:'center',justifyContent:'center',marginBottom:20},
  addEventTxt:{fontSize:15,color:C.green,fontWeight:'600'},
  summaryCard:{backgroundColor:C.lightGreen,borderRadius:14,padding:16,marginBottom:20,borderWidth:1,borderColor:'#C8E6C9'},
  summaryTitle:{fontSize:11,fontWeight:'700',color:C.muted,letterSpacing:1,marginBottom:12},
  summaryRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:6,borderBottomWidth:1,borderBottomColor:'rgba(0,0,0,0.05)'},
  summaryLabel:{fontSize:13,color:C.muted},
  summaryVal:{fontSize:13,color:C.dark,fontWeight:'600'},
  step2Btns:{flexDirection:'row',gap:12,marginBottom:12},
  backStep:{flex:1,height:52,borderRadius:14,borderWidth:1,borderColor:'#DDD',alignItems:'center',justifyContent:'center'},
  backStepTxt:{fontSize:15,color:C.dark,fontWeight:'500'},
  publishBtn:{flex:2,height:52,borderRadius:14,backgroundColor:C.green,alignItems:'center',justifyContent:'center'},
  publishBtnTxt:{fontSize:15,color:C.white,fontWeight:'700'},
  cancelBtn:{height:48,borderRadius:14,borderWidth:1,borderColor:'#FFCCCC',backgroundColor:'#FFF5F5',alignItems:'center',justifyContent:'center'},
  cancelBtnTxt:{fontSize:14,color:'#E53935',fontWeight:'500'},
});
