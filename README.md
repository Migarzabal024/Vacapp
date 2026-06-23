# 🐄 VacApp 2.0

Sistema móvil desarrollado con **React Native + Expo** orientado a la gestión y administración de información ganadera.

---

# 📌 Tecnologías Utilizadas

* React Native
* Expo
* JavaScript
* Node.js
* npm
* Android Studio
* Git y GitHub

---

# 📁 Estructura del Proyecto

```text
VacApp
│
├── assets/             # Imágenes, logos e íconos
├── screens/            # Pantallas de la aplicación
├── App.js              # Componente principal
├── index.js            # Punto de entrada
├── app.json            # Configuración de Expo
├── package.json        # Dependencias del proyecto
├── package-lock.json
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
└── .gitignore
```

---

# 📱 Configuración de Android Studio

## Requisitos

Instalar:

* Android Studio (última versión estable)
* Android SDK Platform 34
* Android Emulator
* Node.js 18 o superior
* npm
* Git

---

# Crear un dispositivo virtual (AVD)

Abrir Android Studio:

```text
More Actions → Virtual Device Manager
```

Seleccionar:

```text
Create Virtual Device
```

### Dispositivo recomendado

```text
Categoría: Phone
Modelo: Pixel 8
```

### Imagen del sistema

```text
Android 14 (Upside Down Cake)
API Level 34
Target: Android 14.0 (Google Play)
ABI: x86_64
```

Finalizar con:

```text
Finish
```

---

# Clonar el proyecto

```bash
git clone -b Marfiles-2.0 https://github.com/Migarzabal024/Vacapp.git

cd Vacapp
```

---

# Instalar dependencias

```bash
npm install
```

Esto generará automáticamente:

```text
node_modules/
```

---

# Ejecutar el proyecto

Abrir el emulador:

```text
Pixel 8 - Android 14 (API 34)
```

Ejecutar:

```bash
npx expo start
```

o:

```bash
npm start
```

Presionar:

```text
a
```

para abrir la aplicación en Android.

---

# Solución de Problemas

## Limpiar caché de Expo

```bash
npx expo start --clear
```

---

## Eliminar e instalar nuevamente las dependencias

Git Bash:

```bash
rm -rf node_modules
rm package-lock.json

npm install
```

Windows:

```cmd
rmdir /s /q node_modules
del package-lock.json

npm install
```

---

# Flujo de Trabajo con Git

## Verificar cambios

```bash
git status
```

## Agregar archivos

```bash
git add .
```

## Crear commit

```bash
git commit -m "Descripción de los cambios"
```

## Subir cambios

```bash
git push origin Marfiles-2.0
```

## Descargar actualizaciones

```bash
git pull origin Marfiles-2.0
```

---

# Dependencias del Proyecto

Instalar todas las dependencias:

```bash
npm install
```

Actualizar dependencias:

```bash
npm update
```

---

# Configuración Recomendada

| Componente          | Configuración  |
| ------------------- | -------------- |
| Dispositivo Virtual | Pixel 8        |
| Sistema Operativo   | Android 14     |
| API                 | 34             |
| Arquitectura        | x86_64         |
| Node.js             | 18+            |
| Expo                | Última versión |
| Rama Git            | Marfiles-2.0   |

---

# Repositorio Oficial

```text
https://github.com/Migarzabal024/Vacapp
```

---

# Rama Principal de Desarrollo

```text
Marfiles-2.0
```

---

# Autor

**Martín Igarzábal**

Proyecto VacApp 2.0
