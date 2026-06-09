═══════════════════════════════════════════════════════════════════
                    INSTRUCTIVO VACAPP
          Guía completa para ejecutar el proyecto
              en cualquier PC con Windows 10/11
═══════════════════════════════════════════════════════════════════

ÍNDICE
──────
1. Programas que necesitás instalar (una sola vez)
2. Configuración del entorno (una sola vez)
3. Configuración de la base de datos con XAMPP (una sola vez)
4. Configuración del proyecto (una sola vez)
5. Cómo ejecutar el proyecto (cada vez que trabajás)
6. Solución de problemas comunes
7. Estructura del proyecto

═══════════════════════════════════════════════════════════════════
PARTE 1 — PROGRAMAS QUE NECESITÁS INSTALAR
═══════════════════════════════════════════════════════════════════

Instalá estos programas EN ESTE ORDEN antes de tocar el proyecto.

─────────────────────────────────────────────────────────────────
1.1 Node.js 18 o superior
─────────────────────────────────────────────────────────────────
Descargá de: https://nodejs.org/en
→ Elegí la versión LTS (la recomendada)
→ Instalá con todas las opciones por defecto
→ Verificá: abrí Git Bash y escribí:
    node --version    (tiene que mostrar v18.x.x o superior)
    npm --version     (tiene que mostrar 9.x.x o superior)

─────────────────────────────────────────────────────────────────
1.2 JDK 17 (Java Development Kit)
─────────────────────────────────────────────────────────────────
IMPORTANTE: React Native 0.73 requiere EXACTAMENTE Java 17.
No uses Java 21 ni versiones anteriores.

Descargá de: https://www.azul.com/downloads/?version=java-17&os=windows&package=jdk
→ Buscá: Java 17 / Windows / x86 64-bit / JDK
→ Descargá el archivo .msi
→ Instalá con todas las opciones por defecto
→ Verificá en Git Bash:
    java -version     (tiene que mostrar openjdk version "17.x.x")

Si ya tenés Java 21 instalado, NO lo desinstalés.
Solo hay que decirle a Gradle que use el 17 (ver Parte 4).

─────────────────────────────────────────────────────────────────
1.3 Android Studio
─────────────────────────────────────────────────────────────────
Descargá de: https://developer.android.com/studio
→ Instalá con todas las opciones por defecto
→ Al abrir por primera vez, completá el Setup Wizard
   (descarga el SDK de Android automáticamente)
→ En SDK Manager (Tools → SDK Manager) verificá que esté
   instalado: Android SDK Platform 35

─────────────────────────────────────────────────────────────────
1.4 Git y Git Bash
─────────────────────────────────────────────────────────────────
Descargá de: https://git-scm.com/download/win
→ Instalá con todas las opciones por defecto
→ Git Bash es la terminal que vas a usar para TODO
   (NUNCA uses PowerShell, da errores de permisos con npm)

─────────────────────────────────────────────────────────────────
1.5 XAMPP (incluye MySQL y phpMyAdmin)
─────────────────────────────────────────────────────────────────
Descargá de: https://www.apachefriends.org/download.html
→ Elegí la versión para Windows
→ Durante la instalación, asegurate de que estén marcados:
   ✅ Apache
   ✅ MySQL
   ✅ phpMyAdmin
→ Instalá en C:\xampp (ruta por defecto, no la cambies)
→ Al terminar, abrí XAMPP Control Panel

NOTA: Si ya tenés MySQL instalado por separado también funciona,
pero XAMPP es más fácil para el equipo porque incluye phpMyAdmin
para ver la base de datos visualmente.

─────────────────────────────────────────────────────────────────
1.6 VS Code (editor de código - recomendado)
─────────────────────────────────────────────────────────────────
Descargá de: https://code.visualstudio.com/
→ Instalá con todas las opciones por defecto

═══════════════════════════════════════════════════════════════════
PARTE 2 — CONFIGURACIÓN DEL ENTORNO (una sola vez)
═══════════════════════════════════════════════════════════════════

─────────────────────────────────────────────────────────────────
2.1 Configurar ANDROID_HOME
─────────────────────────────────────────────────────────────────
1. Abrí el menú inicio y buscá "Variables de entorno"
2. Click en "Editar las variables de entorno del sistema"
3. Click en "Variables de entorno..."
4. En "Variables del sistema" click en "Nueva":
   Nombre: ANDROID_HOME
   Valor:  C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
   (reemplazá TU_USUARIO por tu nombre de usuario de Windows)
5. Buscá la variable "Path" en Variables del sistema
6. Click en "Editar" → "Nuevo" y agregá:
   %ANDROID_HOME%\platform-tools
7. Aceptá todo y cerrá

Verificá en Git Bash (abrí una ventana nueva):
    echo $ANDROID_HOME    (tiene que mostrar la ruta del SDK)
    adb version           (tiene que mostrar la versión de adb)

─────────────────────────────────────────────────────────────────
2.2 Crear emulador Android en Android Studio
─────────────────────────────────────────────────────────────────
1. Abrí Android Studio
2. Click en "More Actions" → "Virtual Device Manager"
3. Click en "Create Device"
4. Elegí: Pixel 6 → Next
5. Elegí: API 35 (Android 15) → Next
   (si no aparece, click en "Download" al lado de API 35)
6. Click en "Finish"
7. Para iniciar el emulador: click en ▶ (Play) al lado del Pixel 6

═══════════════════════════════════════════════════════════════════
PARTE 3 — CONFIGURACIÓN DE LA BASE DE DATOS CON XAMPP
═══════════════════════════════════════════════════════════════════

─────────────────────────────────────────────────────────────────
3.1 Iniciar MySQL desde XAMPP
─────────────────────────────────────────────────────────────────
1. Abrí XAMPP Control Panel
   (buscalo en el menú inicio o en C:\xampp\xampp-control.exe)

2. Click en "Start" al lado de MySQL
   → El botón se pone verde y dice "Running"
   → El puerto que usa es 3306 (el puerto por defecto)

3. OPCIONAL — también podés iniciar Apache si querés usar
   phpMyAdmin para ver la base de datos visualmente

IMPORTANTE: MySQL tiene que estar en "Running" SIEMPRE que
uses el proyecto. Si apagás la PC y volvés a trabajar,
tenés que volver a abrir XAMPP y darle Start a MySQL.

─────────────────────────────────────────────────────────────────
3.2 Verificar que MySQL funciona
─────────────────────────────────────────────────────────────────
En Git Bash ejecutá:
    cd /c/xampp/mysql/bin
    ./mysql -u root -p

→ Si te pide contraseña, en XAMPP por defecto NO hay contraseña.
  Solo apretá Enter.
→ Si ves "mysql>" es que funciona bien.
→ Salí con: exit

─────────────────────────────────────────────────────────────────
3.3 Configurar contraseña de MySQL en XAMPP (recomendado)
─────────────────────────────────────────────────────────────────
Por defecto XAMPP tiene MySQL sin contraseña (usuario root sin pass).
Podés dejarlo así para desarrollo local o ponerle una contraseña.

OPCIÓN A — Sin contraseña (más fácil para desarrollo):
En el archivo backend/.env dejá:
    DB_PASSWORD=
    (la línea vacía, sin nada después del =)

OPCIÓN B — Con contraseña:
En XAMPP Control Panel → click en "Shell" y ejecutá:
    mysqladmin -u root password "tu_nueva_contraseña"

Luego en backend/.env ponés esa contraseña:
    DB_PASSWORD=tu_nueva_contraseña

─────────────────────────────────────────────────────────────────
3.4 Ver la base de datos con phpMyAdmin (visual)
─────────────────────────────────────────────────────────────────
1. En XAMPP Control Panel, también dale Start a Apache
2. Abrí tu navegador y entrá a: http://localhost/phpmyadmin
3. Usuario: root | Contraseña: (la que hayas configurado o vacío)
4. Vas a ver todas las bases de datos
5. Después de correr npm run db:init (Parte 4),
   vas a ver la base de datos "vacapp" con todas sus tablas:
   - USUARIOS
   - ADMINS
   - DOCUMENTOS_KYC
   - PUBLICACIONES
   - IMAGENES_PUBLICACION
   - REGISTROS_TYC
   - TRANSACCIONES
   - RESULTADOS_CRIA
   - AUDITORIA_ADMIN

─────────────────────────────────────────────────────────────────
3.5 Crear la base de datos vacapp
─────────────────────────────────────────────────────────────────
La base de datos se crea automáticamente cuando corrés
npm run db:init (lo hacés en la Parte 4, paso 4.6).

Pero si querés crearla manualmente desde phpMyAdmin:
1. Entrá a http://localhost/phpmyadmin
2. Click en "Nueva" en el panel izquierdo
3. Nombre de la base de datos: vacapp
4. Cotejamiento: utf8mb4_unicode_ci
5. Click en "Crear"

═══════════════════════════════════════════════════════════════════
PARTE 4 — CONFIGURACIÓN DEL PROYECTO (una sola vez)
═══════════════════════════════════════════════════════════════════

Abrí Git Bash. Todos los comandos se ejecutan en Git Bash,
NO en PowerShell ni en CMD.

─────────────────────────────────────────────────────────────────
4.1 Navegar a la carpeta del proyecto
─────────────────────────────────────────────────────────────────
    cd /c/Proyectos/vacapp_cli
    (ajustá la ruta según dónde tengas el proyecto)

    Verificá que estás en el lugar correcto:
    ls
    (tiene que mostrar: android, backend, src, App.tsx, etc.)

─────────────────────────────────────────────────────────────────
4.2 Configurar Java 17 para Gradle
─────────────────────────────────────────────────────────────────
    echo 'org.gradle.java.home=C\:\\Program Files\\Zulu\\zulu-17' >> android/gradle.properties

    Verificá que quedó bien:
    cat android/gradle.properties
    (tiene que aparecer la línea org.gradle.java.home al final)

─────────────────────────────────────────────────────────────────
4.3 Crear el archivo local.properties de Android
─────────────────────────────────────────────────────────────────
    echo 'sdk.dir=C\:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk' > android/local.properties
    (reemplazá TU_USUARIO por tu nombre de usuario de Windows)

    Verificá:
    cat android/local.properties

─────────────────────────────────────────────────────────────────
4.4 Corregir el nombre del componente en MainActivity
─────────────────────────────────────────────────────────────────
    sed -i 's/getMainComponentName(): String = "TempApp"/getMainComponentName(): String = "VacApp"/' android/app/src/main/java/com/vacapp/MainActivity.kt

    Verificá:
    cat android/app/src/main/java/com/vacapp/MainActivity.kt
    (tiene que mostrar: override fun getMainComponentName(): String = "VacApp")

─────────────────────────────────────────────────────────────────
4.5 Instalar dependencias del frontend
─────────────────────────────────────────────────────────────────
    (estando en la carpeta raíz del proyecto)
    npm install

    Espera que termine. Puede tardar 3-5 minutos la primera vez.

─────────────────────────────────────────────────────────────────
4.6 Configurar e inicializar el backend
─────────────────────────────────────────────────────────────────
    cd backend
    npm install

    Ahora editá el archivo backend/.env con VS Code o Bloc de notas:

        DB_HOST=localhost
        DB_PORT=3306
        DB_USER=root
        DB_PASSWORD=           ← dejá vacío si usás XAMPP sin contraseña
        DB_NAME=vacapp
        JWT_SECRET=vacapp_secreto_super_largo_y_seguro_2024
        JWT_EXPIRES_IN=7d
        PORT=3000
        NODE_ENV=development

    IMPORTANTE: Asegurate de que MySQL esté corriendo en XAMPP
    antes de ejecutar el siguiente comando.

    Creá la base de datos y las tablas (solo la primera vez):
    npm run db:init

    Tiene que mostrar:
    ✅ Conectado a MySQL
    ✅ Base de datos y tablas creadas correctamente

    Volvé a la carpeta raíz:
    cd ..

═══════════════════════════════════════════════════════════════════
PARTE 5 — CÓMO EJECUTAR EL PROYECTO (cada vez que trabajás)
═══════════════════════════════════════════════════════════════════

Necesitás tener TRES terminales Git Bash abiertas al mismo tiempo
más XAMPP corriendo y el emulador de Android Studio.

─────────────────────────────────────────────────────────────────
PASO 1 — Iniciá MySQL en XAMPP
─────────────────────────────────────────────────────────────────
1. Abrí XAMPP Control Panel
2. Click en "Start" al lado de MySQL
3. Esperá que diga "Running" en verde
4. (Opcional) También iniciá Apache si querés usar phpMyAdmin

─────────────────────────────────────────────────────────────────
PASO 2 — Iniciá el emulador en Android Studio
─────────────────────────────────────────────────────────────────
1. Abrí Android Studio
2. Click en "More Actions" → "Virtual Device Manager"
3. Click en ▶ (Play) al lado del Pixel 6
4. Esperá a que el emulador cargue completamente
   (que se vea el escritorio de Android)

─────────────────────────────────────────────────────────────────
PASO 3 — Terminal 1: Backend
─────────────────────────────────────────────────────────────────
Abrí Git Bash y ejecutá:

    cd /c/Proyectos/vacapp_cli/backend
    npm run dev

Tiene que aparecer:
    ✅ VacApp API corriendo en http://localhost:3000
    Entorno: development

DEJÁ ESTA TERMINAL ABIERTA Y CORRIENDO.

─────────────────────────────────────────────────────────────────
PASO 4 — Terminal 2: Metro Bundler (servidor JavaScript)
─────────────────────────────────────────────────────────────────
Abrí una NUEVA ventana de Git Bash y ejecutá:

    cd /c/Proyectos/vacapp_cli
    npm start

Tiene que aparecer el logo de Metro y:
    info Dev server ready
    i - run on iOS
    a - run on Android
    r - reload app

DEJÁ ESTA TERMINAL ABIERTA Y CORRIENDO.

─────────────────────────────────────────────────────────────────
PASO 5 — Terminal 3: Compilar e instalar en Android
─────────────────────────────────────────────────────────────────
Abrí una NUEVA ventana de Git Bash y ejecutá:

    cd /c/Proyectos/vacapp_cli
    npm run android

La primera vez tarda 10-15 minutos mientras descarga y compila.
Las siguientes veces tarda 1-2 minutos.

Al finalizar tiene que aparecer:
    BUILD SUCCESSFUL
    Installed on 1 device.

La app se abre automáticamente en el emulador.

NOTA: Una vez que la app está instalada, la próxima vez que
trabajes NO necesitás correr npm run android de nuevo.
Solo necesitás las Terminales 1 y 2 (backend + Metro).
Si hacés cambios en el código, apretá "r" en Metro para recargar.

─────────────────────────────────────────────────────────────────
PASO 6 — Verificar que todo funciona
─────────────────────────────────────────────────────────────────
En el emulador deberías ver:
1. Pantalla de Splash con el logo VacApp 🐄 y animación
2. Pantalla de Onboarding (3 slides, podés saltar)
3. Pantalla de Login
4. Registrarte con nombre, email, DNI, CUIT y contraseña
5. Al ingresar → Pantalla Home con el catálogo de animales
6. Podés tocar un animal para ver el detalle

═══════════════════════════════════════════════════════════════════
PARTE 6 — SOLUCIÓN DE PROBLEMAS COMUNES
═══════════════════════════════════════════════════════════════════

─────────────────────────────────────────────────────────────────
PROBLEMA: "npm no se reconoce" o error de scripts deshabilitados
─────────────────────────────────────────────────────────────────
CAUSA: Estás usando PowerShell en lugar de Git Bash.
SOLUCIÓN: Cerrá PowerShell y abrí Git Bash.

─────────────────────────────────────────────────────────────────
PROBLEMA: "SDK location not found"
─────────────────────────────────────────────────────────────────
CAUSA: Falta el archivo android/local.properties.
SOLUCIÓN:
    echo 'sdk.dir=C\:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk' > android/local.properties

─────────────────────────────────────────────────────────────────
PROBLEMA: "TempApp has not been registered"
─────────────────────────────────────────────────────────────────
CAUSA: MainActivity.kt tiene el nombre incorrecto.
SOLUCIÓN:
    sed -i 's/"TempApp"/"VacApp"/' android/app/src/main/java/com/vacapp/MainActivity.kt
    npm run android

─────────────────────────────────────────────────────────────────
PROBLEMA: Puerto 8081 en uso (EADDRINUSE)
─────────────────────────────────────────────────────────────────
CAUSA: Metro ya está corriendo en otra terminal.
SOLUCIÓN:
    cmd //c "netstat -ano | findstr :8081"
    (anotá el número PID que aparece al final)
    cmd //c "taskkill /PID NUMERO /F"
    npm start

─────────────────────────────────────────────────────────────────
PROBLEMA: BUILD FAILED - errores de caché de Gradle
─────────────────────────────────────────────────────────────────
CAUSA: Caché corrupta de Gradle.
SOLUCIÓN:
    cmd //c "wmic process where name='java.exe' delete"
    rm -rf android/.gradle
    rm -rf ~/.gradle/caches/transforms-3
    npm run android

─────────────────────────────────────────────────────────────────
PROBLEMA: "No emulators found"
─────────────────────────────────────────────────────────────────
CAUSA: El emulador de Android Studio no está corriendo.
SOLUCIÓN: Abrí Android Studio → Virtual Device Manager → ▶ Play

─────────────────────────────────────────────────────────────────
PROBLEMA: MySQL connection refused / Error al conectar la BD
─────────────────────────────────────────────────────────────────
CAUSA: MySQL no está corriendo en XAMPP.
SOLUCIÓN:
    1. Abrí XAMPP Control Panel
    2. Click en "Start" al lado de MySQL
    3. Esperá que diga "Running"
    4. Volvé a correr: npm run dev (en la carpeta backend)

─────────────────────────────────────────────────────────────────
PROBLEMA: Access denied for user 'root'@'localhost'
─────────────────────────────────────────────────────────────────
CAUSA: La contraseña en backend/.env no coincide con MySQL.
SOLUCIÓN:
    En XAMPP, MySQL por defecto NO tiene contraseña.
    Abrí backend/.env y dejá:
        DB_PASSWORD=
    (sin nada después del igual)

─────────────────────────────────────────────────────────────────
PROBLEMA: Error de conexión al backend desde la app
─────────────────────────────────────────────────────────────────
CAUSA: La URL del backend puede variar según el entorno.
SOLUCIÓN: Editá src/constants/index.ts:

    Para emulador Android (siempre usar esta):
    export const API_BASE_URL = 'http://10.0.2.2:3000/api';

    Para celular físico (reemplazá X con tu IP local):
    export const API_BASE_URL = 'http://192.168.0.X:3000/api';

    Para encontrar tu IP local en Windows:
    Abrí CMD y ejecutá: ipconfig
    Buscá "Dirección IPv4" en tu adaptador de red

─────────────────────────────────────────────────────────────────
PROBLEMA: La app muestra pantalla blanca
─────────────────────────────────────────────────────────────────
CAUSA: Metro no está conectado al emulador.
SOLUCIÓN:
    1. En la terminal de Metro apretá la tecla "a"
    2. O ejecutá en Git Bash: adb shell input keyevent 82
    3. En el emulador seleccioná "Reload"

═══════════════════════════════════════════════════════════════════
PARTE 7 — ESTRUCTURA DEL PROYECTO
═══════════════════════════════════════════════════════════════════

vacapp_cli/
├── android/                    ← Config nativa Android
│   ├── app/src/main/
│   │   ├── java/com/vacapp/
│   │   │   ├── MainActivity.kt   ← IMPORTANTE: debe decir "VacApp"
│   │   │   └── MainApplication.kt
│   │   └── AndroidManifest.xml
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties  ← Versión de Gradle (8.8)
│   ├── build.gradle              ← compileSdk = 35
│   ├── gradle.properties         ← org.gradle.java.home = JDK 17
│   └── local.properties          ← sdk.dir (crear manualmente)
│
├── backend/                    ← API REST Node.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             ← Conexión MySQL
│   │   │   ├── initDb.js         ← Crear tablas (npm run db:init)
│   │   │   └── schema.sql        ← Definición de tablas
│   │   ├── controllers/
│   │   │   └── authController.js ← Login, Register, GetMe
│   │   ├── middleware/
│   │   │   └── auth.js           ← Validación JWT
│   │   └── routes/
│   │       ├── auth.js           ← POST /auth/login, /register
│   │       └── users.js          ← GET /users/me
│   ├── index.js                  ← Punto de entrada del backend
│   └── .env                      ← Variables de entorno (no subir a git)
│
├── src/                        ← Código React Native
│   ├── constants/index.ts        ← Colores, URLs, mock data
│   ├── context/AuthContext.tsx   ← Estado global de autenticación
│   ├── navigation/
│   │   ├── AppNavigator.tsx      ← Navegación principal
│   │   └── types.ts              ← Tipos de rutas
│   ├── screens/
│   │   ├── SplashScreen.tsx      ← Pantalla inicial animada
│   │   ├── OnboardingScreen.tsx  ← 3 slides introductorios
│   │   ├── LoginScreen.tsx       ← Formulario de login
│   │   ├── RegisterScreen.tsx    ← Registro en 3 pasos
│   │   ├── HomeScreen.tsx        ← Catálogo de animales
│   │   └── AnimalDetailScreen.tsx← Detalle de un animal
│   ├── services/
│   │   ├── httpClient.ts         ← Cliente HTTP con JWT
│   │   └── api/authService.ts    ← Llamadas a la API de auth
│   └── types/index.ts            ← Tipos TypeScript globales
│
├── App.tsx                     ← Componente raíz
├── index.js                    ← Punto de entrada React Native
└── package.json                ← Dependencias del frontend

═══════════════════════════════════════════════════════════════════
ENDPOINTS DEL BACKEND
═══════════════════════════════════════════════════════════════════

Base URL (emulador): http://10.0.2.2:3000/api

GET  /health          → Verificar que el backend corre
POST /auth/register   → Registrar nuevo usuario
POST /auth/login      → Iniciar sesión
POST /auth/logout     → Cerrar sesión (requiere token JWT)
GET  /users/me        → Datos del usuario logueado (requiere JWT)

═══════════════════════════════════════════════════════════════════
VERSIONES EXACTAS PROBADAS Y FUNCIONALES
═══════════════════════════════════════════════════════════════════

Node.js:               v22.x o v18.x
npm:                   10.x
Java (JDK):            17 (Zulu 17)
Gradle:                8.8
Android Gradle Plugin: 8.3.0
compileSdk:            35
targetSdk:             35
minSdk:                21
React Native:          0.73.6
Android Studio:        Ladybug o superior
MySQL:                 8.0 (vía XAMPP)
XAMPP:                 8.2.x o superior

═══════════════════════════════════════════════════════════════════
RESUMEN RÁPIDO — COMANDOS DEL DÍA A DÍA
═══════════════════════════════════════════════════════════════════

ANTES DE EMPEZAR:
    1. Abrí XAMPP → Start MySQL
    2. Abrí Android Studio → Virtual Device Manager → ▶ Pixel 6

Terminal 1 (backend):
    cd /c/Proyectos/vacapp_cli/backend && npm run dev

Terminal 2 (Metro):
    cd /c/Proyectos/vacapp_cli && npm start

Terminal 3 (solo si es la primera vez o reinstalás):
    cd /c/Proyectos/vacapp_cli && npm run android

Si ya instalaste la app y solo querés recargar cambios:
    → En la terminal de Metro apretá "r"
    → O en el emulador apretá Ctrl+M → Reload

Para ver la base de datos visualmente:
    → Abrí XAMPP → Start Apache
    → Entrá a http://localhost/phpmyadmin en tu navegador

═══════════════════════════════════════════════════════════════════
