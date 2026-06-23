import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const C = { bg:'#0D2818', white:'#FFFFFF', green:'#4CAF50', lGreen:'#43D854', muted:'#A0C4A8', dark:'#1A1A1A', gray:'#666', border:'#E8E8E8', red:'#E53935' };

const TRENDS = [
  { name:'Toros Aberdeen Angus', price:'$ 850.000', change:'+5.2%', up:true, emoji:'🐂' },
  { name:'Vacas Hereford',       price:'$ 620.000', change:'+3.1%', up:true, emoji:'🐄' },
  { name:'Novillos Braford',     price:'$ 720.000', change:'-1.8%', up:false, emoji:'🥩' },
  { name:'Vaquillonas Brangus',  price:'$ 480.000', change:'+7.5%', up:true, emoji:'🌿' },
];

const DISTRIBUTION = [
  { label:'Menos de $500k', count:145, pct:35 },
  { label:'$500k - $750k',  count:198, pct:48 },
  { label:'$750k - $1M',    count:56,  pct:13 },
  { label:'Más de $1M',     count:18,  pct:4 },
];

const INSIGHTS = [
  { icon:'📈', title:'Demanda alta en Aberdeen Angus', desc:'Los toros Aberdeen Angus registraron un aumento del 5.2% en el último mes, con alta demanda en Buenos Aires y Córdoba.' },
  { icon:'💡', title:'Mejor momento para vender vaquillonas', desc:'Las vaquillonas Brangus tuvieron un incremento del 7.5% en el último mes. Es un buen momento para considerar ventas.' },
];

export default function MarketScreen() {
  const [period, setPeriod] = useState('30');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn}><Text style={s.backIcon}>‹</Text></TouchableOpacity>
        <Text style={s.title}>Mercado & Precios</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Tabs período */}
        <View style={s.periodTabs}>
          {['7','30','90'].map(p => (
            <TouchableOpacity key={p} style={[s.periodTab, period===p && s.periodTabActive]} onPress={()=>setPeriod(p)}>
              <Text style={[s.periodTabTxt, period===p && s.periodTabTxtActive]}>{p} días</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats principales */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <View style={s.statIcon}><Text style={s.statIconTxt}>📊</Text></View>
            <Text style={s.statNum}>1.240</Text>
            <Text style={s.statLabel}>Total publicaciones</Text>
            <Text style={s.statChange}>▲ +12%</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIcon,{backgroundColor:'#E8F5E9'}]}><Text style={s.statIconTxt}>$</Text></View>
            <Text style={s.statNum}>$685k</Text>
            <Text style={s.statLabel}>Precio promedio</Text>
            <Text style={s.statChange}>▲ +4.2%</Text>
          </View>
        </View>

        {/* Tendencias */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Tendencias por Categoría</Text>
          <Text style={s.sectionSub}>📅 Últimos 30 días</Text>
        </View>
        <View style={s.trendList}>
          {TRENDS.map((t,i) => (
            <View key={i} style={s.trendRow}>
              <View style={s.trendLeft}>
                <View style={s.trendIcon}><Text style={s.trendEmoji}>{t.emoji}</Text></View>
                <View>
                  <Text style={s.trendName}>{t.name}</Text>
                  <Text style={s.trendSub}>Precio promedio</Text>
                </View>
              </View>
              <View style={s.trendRight}>
                <Text style={s.trendPrice}>{t.price}</Text>
                <Text style={[s.trendChange, !t.up && {color:C.red}]}>{t.up?'▲':'▼'} {t.change}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Distribución */}
        <Text style={[s.sectionTitle,{paddingHorizontal:16,marginBottom:12,marginTop:20}]}>Distribución de Precios</Text>
        <View style={s.distCard}>
          {DISTRIBUTION.map((d,i) => (
            <View key={i} style={s.distRow}>
              <View style={s.distHeader}>
                <Text style={s.distLabel}>{d.label}</Text>
                <Text style={s.distCount}>{d.count} animales ({d.pct}%)</Text>
              </View>
              <View style={s.distBarBg}>
                <View style={[s.distBar, {width:`${d.pct}%`}]}/>
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <Text style={[s.sectionTitle,{paddingHorizontal:16,marginBottom:12,marginTop:20}]}>Insights del Mercado</Text>
        <View style={s.insightList}>
          {INSIGHTS.map((ins,i) => (
            <View key={i} style={s.insightCard}>
              <View style={s.insightIcon}><Text style={s.insightIconTxt}>{ins.icon}</Text></View>
              <View style={s.insightBody}>
                <Text style={s.insightTitle}>{ins.title}</Text>
                <Text style={s.insightDesc}>{ins.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#F5F7F5'},
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:52,paddingBottom:12,gap:12},
  backBtn:{width:36,height:36,borderRadius:12,backgroundColor:'#E8E8E8',alignItems:'center',justifyContent:'center'},
  backIcon:{fontSize:22,color:C.dark,fontWeight:'300'},
  title:{fontSize:22,fontWeight:'700',color:C.dark},
  scroll:{paddingBottom:100},
  periodTabs:{flexDirection:'row',marginHorizontal:16,backgroundColor:C.white,borderRadius:14,padding:4,gap:4,marginBottom:16},
  periodTab:{flex:1,paddingVertical:10,borderRadius:10,alignItems:'center'},
  periodTabActive:{backgroundColor:C.green},
  periodTabTxt:{fontSize:13,fontWeight:'600',color:C.gray},
  periodTabTxtActive:{color:C.white},
  statsRow:{flexDirection:'row',gap:12,paddingHorizontal:16,marginBottom:20},
  statCard:{flex:1,backgroundColor:C.white,borderRadius:16,padding:14,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:2},
  statIcon:{width:36,height:36,borderRadius:10,backgroundColor:'#FFF3E0',alignItems:'center',justifyContent:'center',marginBottom:8},
  statIconTxt:{fontSize:18},
  statNum:{fontSize:20,fontWeight:'700',color:C.dark},
  statLabel:{fontSize:11,color:C.gray,marginTop:2},
  statChange:{fontSize:11,color:C.green,fontWeight:'600',marginTop:4},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,marginBottom:12},
  sectionTitle:{fontSize:17,fontWeight:'700',color:C.dark},
  sectionSub:{fontSize:12,color:C.gray},
  trendList:{paddingHorizontal:16,gap:0,backgroundColor:C.white,marginHorizontal:16,borderRadius:16,overflow:'hidden'},
  trendRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:14,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  trendLeft:{flexDirection:'row',alignItems:'center',gap:12},
  trendIcon:{width:40,height:40,borderRadius:10,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  trendEmoji:{fontSize:20},
  trendName:{fontSize:13,fontWeight:'600',color:C.dark},
  trendSub:{fontSize:11,color:C.gray},
  trendRight:{alignItems:'flex-end'},
  trendPrice:{fontSize:14,fontWeight:'700',color:C.dark},
  trendChange:{fontSize:12,fontWeight:'600',color:C.green,marginTop:2},
  distCard:{marginHorizontal:16,backgroundColor:C.white,borderRadius:16,padding:16,gap:14},
  distRow:{gap:6},
  distHeader:{flexDirection:'row',justifyContent:'space-between'},
  distLabel:{fontSize:13,fontWeight:'500',color:C.dark},
  distCount:{fontSize:12,color:C.gray},
  distBarBg:{height:8,backgroundColor:'#E8F5E9',borderRadius:4},
  distBar:{height:8,backgroundColor:C.green,borderRadius:4},
  insightList:{paddingHorizontal:16,gap:12,marginBottom:20},
  insightCard:{flexDirection:'row',backgroundColor:C.white,borderRadius:16,padding:14,gap:12,borderLeftWidth:4,borderLeftColor:C.green},
  insightIcon:{width:44,height:44,borderRadius:10,backgroundColor:'#E8F5E9',alignItems:'center',justifyContent:'center'},
  insightIconTxt:{fontSize:22},
  insightBody:{flex:1},
  insightTitle:{fontSize:14,fontWeight:'700',color:C.dark,marginBottom:4},
  insightDesc:{fontSize:12,color:C.gray,lineHeight:18},
});
