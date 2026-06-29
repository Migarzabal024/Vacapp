# 🐄 VacApp — Marketplace de Genética Bovina

> Plataforma móvil para la compra y venta de ganado con genética verificada, trazabilidad completa y transacciones con QR en campo.

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Links del Proyecto](#links-del-proyecto)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Levantar el Proyecto con Expo Go](#levantar-el-proyecto-con-expo-go)
- [Levantar en Emulador Android Studio](#levantar-en-emulador-android-studio)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Pantallas de la App](#pantallas-de-la-app)
- [Base de Datos Supabase](#base-de-datos-supabase)
- [Flujo de Transacción QR](#flujo-de-transacción-qr)
- [Panel Administrador](#panel-administrador)

---

## 📱 Descripción

VacApp es una aplicación móvil desarrollada en React Native que permite a productores ganaderos publicar, explorar y comprar animales con genética verificada. Incluye un sistema de verificación KYC, transacciones confirmadas por código QR en campo y un panel de administración completo.

### Funcionalidades principales

- 🔐 Registro e inicio de sesión con Supabase Auth
- 📋 Publicación de animales con foto, datos genéticos y precio
- 🛒 Marketplace real entre usuarios con filtros avanzados
- ❤️ Sistema de favoritos
- 💵 Flujo de compra con generación y escaneo de QR
- 🛡️ Verificación KYC de vendedores
- 💬 Sistema de soporte con chat entre usuario y administrador
- 👤 Panel de administración completo

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | SDK 56 | Framework móvil |
| Expo Go | 56.0.1 | Entorno de desarrollo |
| Supabase | Latest | Base de datos y autenticación |
| expo-camera | ~56.0.8 | Escaneo de QR |
| expo-image-picker | ~56.0.18 | Carga de fotos |
| expo-file-system | ~56.0.8 | Manejo de archivos |
| react-native-qrcode-svg | Latest | Generación de QR |
| @react-navigation/native | Latest | Navegación |

---

## 🔗 Links del Proyecto

| Recurso | Link |
|---|---|
| 🗄️ Base de Datos Supabase | [https://supabase.com/dashboard/project/ozwwebxuqzbmianmlwgd](https://supabase.com/dashboard/project/ozwwebxuqzbmianmlwgd) |
| 🎨 Prototipo Figma (IA - desactualizado) | [VacApp 2.5 IA con Admin](https://www.figma.com/make/OV5C8BqLGwqSTYWEVF7GPp/VacApp-2.5-IA-con-usuario-Admin?p=f&t=8q1q1B7Vb5cNSzL1-0&preview-route=%2Fhome) |

---

## 🔑 Credenciales de Prueba

> ⚠️ **Solo para desarrollo y testing. No usar en producción.**

### Usuario Administrador
```
Email:    martinigarzabal011@gmail.com
Password: 123456
Rol:      admin
```

### Usuario de Prueba (Comprador/Vendedor)
```
Email:    caro.coronel.47.cc@gmail.com
Password: 789456
Rol:      user
```

---

## ✅ Requisitos Previos

### Software necesario

- [Node.js LTS](https://nodejs.org/) (versión 18 o superior)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) (para emulador)
- [Expo Go](https://expo.dev/go) versión **56.0.1** o superior instalado en el celular

### Emulador recomendado (Android Studio)

```
Dispositivo: Pixel 8
Android:     14.0
API Level:   34
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd VacApp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Verificar configuración de Supabase

El archivo `lib/supabase.js` ya tiene las credenciales configuradas:

```js
const supabaseUrl  = 'https://ozwwebxuqzbmianmlwgd.supabase.co'
const supabaseKey  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

> No es necesario configurar variables de entorno para desarrollo local.

---

## 📱 Levantar el Proyecto con Expo Go (Celular Físico)

### Requisitos
- Celular con **Expo Go versión 56** instalado
- Celular y PC en la **misma red WiFi**

### Pasos

**1. Iniciar el servidor Metro:**
```bash
npx expo start --go --clear
```

**2. Aparecerá un QR en la terminal:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above to open in Expo Go
```

**3. En el celular:**
- Abrí **Expo Go**
- Tocá **"Scan QR code"**
- Escaneá el QR que aparece en la terminal

**4. Seleccioná "Expo Go"** cuando pregunte cómo abrir el proyecto

> ⚠️ Asegurate de tener Expo Go **versión 56** — la versión 54 no es compatible con SDK 56.

### Recargar cambios

Con la app abierta, en la terminal presioná **`r`** para recargar.

---

## 🤖 Levantar en Emulador Android Studio

### Configuración del emulador

1. Abrí **Android Studio**
2. Andá a **Device Manager** (ícono de celular en la barra lateral)
3. Creá o seleccioná:
   - **Dispositivo:** Pixel 8
   - **Sistema:** Android 14.0
   - **API Level:** 34
4. Iniciá el emulador con el botón ▶

### Correr la app en el emulador

```bash
npx expo start --android --go --clear
```

O si Metro ya está corriendo, presioná **`a`** para abrir en Android.

### Limpiar caché del emulador (si hay problemas)

```bash
# Verificar conexión
adb devices

# Limpiar caché de la app
adb shell pm clear com.migarzabal011.VacApp

# Reiniciar emulador
adb reboot
```

---

## 📁 Estructura del Proyecto

```
VacApp/
├── App.js                    # Navegación principal
├── app.json                  # Configuración Expo
├── package.json
├── assets/                   # Íconos y recursos
├── context/
│   └── AuthContext.js        # Contexto global de autenticación
├── lib/
│   └── supabase.js           # Cliente Supabase
└── screens/
    ├── SplashScreen.jsx
    ├── OnboardingScreen.jsx
    ├── LoginScreen.jsx
    ├── RegisterScreen.jsx
    ├── HomeScreen.jsx
    ├── ExploreScreen.jsx
    ├── MarketScreen.jsx
    ├── PublicationsScreen.jsx
    ├── NewPublicationScreen.jsx
    ├── PublicationDetailScreen.jsx
    ├── FavoritesScreen.jsx
    ├── TransactionsScreen.jsx
    ├── PurchaseScreen.jsx
    ├── QRScannerScreen.jsx
    ├── ProfileScreen.jsx
    ├── EditProfileScreen.jsx
    ├── UserSupportScreen.jsx
    ├── AdminLoginScreen.jsx
    ├── AdminDashboardScreen.jsx
    ├── AdminUsersScreen.jsx
    ├── AdminPublicationsScreen.jsx
    └── AdminHelpDeskScreen.jsx
```

---

## 📺 Pantallas de la App

### Usuario
| Pantalla | Descripción |
|---|---|
| Splash | Animación de carga inicial |
| Onboarding | 3 slides de bienvenida con swipe |
| Login / Register | Autenticación con Supabase |
| Home | Feed de publicaciones de otros usuarios con búsqueda |
| Explore | Explorar por raza y provincia |
| Market | Marketplace con filtros avanzados de precio, fecha, raza y categoría |
| Mis Publicaciones | CRUD de publicaciones propias |
| Nueva Publicación | Formulario 2 pasos con foto |
| Detalle | Info completa del animal con favoritos y compra |
| Favoritos | Animales guardados con ❤️ |
| Transacciones | Historial de compras y ventas |
| Compra (QR) | Flujo de compra con generación de QR |
| Scanner QR | Escaneo para confirmar entrega en campo |
| Perfil | Datos reales del usuario |
| Editar Perfil | Modificar nombre, teléfono y ubicación |
| Soporte | Chat con el equipo de administración |

### Administrador
| Pantalla | Descripción |
|---|---|
| Admin Login | Acceso restringido por rol |
| Dashboard | Stats reales: usuarios, publicaciones, transacciones, volumen |
| Usuarios & KYC | Verificar, rechazar o aprobar identidades |
| Publicaciones | Aprobar, pausar, rechazar o eliminar publicaciones |
| Help Desk | Chat en tiempo real con usuarios que abren tickets |

---

## 🗄️ Base de Datos Supabase

### Tablas principales

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios con rol (`user` / `admin`), KYC, rating |
| `publications` | Publicaciones de animales con estado y foto |
| `transactions` | Compras con QR único y confirmación |
| `favorites` | Relación usuario-publicación favorita |
| `support_tickets` | Consultas de soporte con urgencia |
| `support_messages` | Mensajes del chat de soporte |
| `reproductive_history` | Historial reproductivo de animales |
| `reviews` | Reseñas de transacciones |
| `notifications` | Notificaciones del sistema |

### URL del proyecto Supabase
```
https://ozwwebxuqzbmianmlwgd.supabase.co
```

---

## 🔲 Flujo de Transacción QR

```
Comprador                          Vendedor
    │                                  │
    │  1. Ve publicación del vendedor   │
    │  2. Toca "Comprar ahora"          │
    │  3. Confirma detalle              │
    │  4. Se genera QR único ──────────►│
    │                                  │
    │                    5. Ve transacción pendiente
    │                    6. Escanea el QR del comprador
    │                    7. Confirma entrega
    │                                  │
    │◄─────── 8. Transacción → "Completada"
    │◄─────── 9. Publicación → "Vendida"
```

---

## 🛡️ Panel Administrador

El acceso admin se hace desde el login normal tocando **"Acceso Administrador"**.

### Permisos del admin en Supabase (RLS)
- Ver y actualizar **todas** las publicaciones
- Ver y actualizar **todos** los tickets de soporte
- Ver y actualizar estado KYC de **todos** los usuarios
- Ver **todas** las transacciones

---

## 📦 Dependencias principales

```json
{
  "expo": "~56.0.12",
  "expo-camera": "~56.0.8",
  "expo-file-system": "~56.0.8",
  "expo-image-picker": "~56.0.18",
  "react-native-qrcode-svg": "latest",
  "@react-navigation/native": "latest",
  "@react-navigation/native-stack": "latest",
  "@react-navigation/bottom-tabs": "latest",
  "@supabase/supabase-js": "latest"
}
```

*README Ultima MOdificacion el 29/06/2026 06:15*
