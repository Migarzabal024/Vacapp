# VacApp — React Native CLI

## Requisitos
- Node.js 18+
- JDK 17
- Android Studio con emulador Pixel 6 (API 35)
- `ANDROID_HOME` configurado en las variables de entorno

## Primera vez — Setup completo

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu password de MySQL
npm run db:init
npm run dev
```

### 2. Frontend
```bash
# Instalar dependencias
npm install

# Correr en Android (emulador debe estar abierto)
npm run android
```

## Desde la segunda vez
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (emulador abierto)
npm run android
```

## Para todo el equipo

### Android Studio
1. Abrí Android Studio
2. File → Open → seleccioná la carpeta `android/` del proyecto
3. Esperá que sincronice el Gradle
4. Corré con el botón ▶

### VS Code
1. Abrí la carpeta del proyecto
2. En terminal corré: `npm run android`

## Cambiar URL del backend
Editá `src/constants/index.ts`:
```ts
// Emulador Android:
export const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Celular físico (reemplazar X con tu IP):
// export const API_BASE_URL = 'http://192.168.0.X:3000/api';
```

## Variables de entorno del backend (backend/.env)
```
DB_HOST=localhost
DB_PASSWORD=          # tu password de MySQL
JWT_SECRET=secreto_largo
PORT=3000
```
