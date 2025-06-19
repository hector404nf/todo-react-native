# React Native Development Rules - Windows

## Configuración del Entorno

### Requisitos Previos
- **Node.js**: Versión LTS (18.x o superior)
- **pnpm**: Gestor de paquetes principal
- **Java Development Kit**: JDK 17 (recomendado)
- **Android Studio**: Con Android SDK
- **React Native CLI**: Instalado globalmente

### Comandos de Instalación
```bash
# Instalar pnpm si no está instalado
npm install -g pnpm

# Instalar React Native CLI
pnpm add -g @react-native-community/cli

# Verificar instalación
npx react-native doctor
```

## Estructura de Proyecto

### Crear Nuevo Proyecto
```bash
npx react-native init NombreApp --pm pnpm
cd NombreApp
```

### Estructura de Carpetas Recomendada
```
src/
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la aplicación
├── navigation/         # Configuración de navegación
├── services/           # APIs y servicios externos
├── utils/              # Funciones utilitarias
├── hooks/              # Custom hooks
├── context/            # Context providers
├── assets/             # Imágenes, fuentes, etc.
└── types/              # Definiciones de TypeScript
```

## Reglas de Nomenclatura

### Archivos y Carpetas
- **Carpetas**: snake_case o kebab-case
- **Componentes**: PascalCase (ej: `UserProfile.tsx`)
- **Screens**: PascalCase con sufijo Screen (ej: `HomeScreen.tsx`)
- **Hooks**: camelCase con prefijo use (ej: `useAuth.ts`)
- **Servicios**: camelCase con sufijo Service (ej: `apiService.ts`)
- **Tipos**: PascalCase con sufijo Type (ej: `UserType.ts`)

### Variables y Funciones
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Funciones**: camelCase
- **Interfaces**: PascalCase con prefijo I (ej: `IUser`)

## Configuración de AdMob

### Instalación
```bash
pnpm add react-native-google-mobile-ads
```

### Configuración Android
1. **android/app/build.gradle**:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:22.6.0'
}
```

2. **android/app/src/main/AndroidManifest.xml**:
```xml
<application>
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>
</application>
```

### Implementación de AdMob
```typescript
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// Usar TestIds durante desarrollo
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';
```

## Dependencias Recomendadas

### Core
```bash
pnpm add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
pnpm add react-native-screens react-native-safe-area-context
pnpm add react-native-gesture-handler react-native-reanimated
```

### Estado y Datos
```bash
pnpm add @reduxjs/toolkit react-redux
# O alternativamente
pnpm add zustand
```

### UI y Estilos
```bash
pnpm add react-native-vector-icons
pnpm add react-native-paper
# O alternativamente
pnpm add native-base
```

### Utilidades
```bash
pnpm add react-native-async-storage/async-storage
pnpm add react-native-permissions
pnpm add react-native-device-info
```

## Configuración TypeScript

### tsconfig.json
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@assets/*": ["src/assets/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["src/**/*", "index.js"],
  "exclude": ["node_modules", "android", "ios"]
}
```

### babel.config.js
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@assets': './src/assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
```

## Comandos de Desarrollo

### Desarrollo
```bash
# Limpiar cache
pnpm start --reset-cache

# Ejecutar en Android
pnpm android

# Ejecutar en modo release
pnpm android --mode release

# Instalar dependencias después de agregar una nueva
pnpm install
cd android && ./gradlew clean && cd ..
```

### Build y Release

#### Generar Keystore (Solo una vez)
```bash
keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### Configurar gradle.properties
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=tu_password
MYAPP_UPLOAD_KEY_PASSWORD=tu_password
```

#### Generar APK/AAB
```bash
cd android
./gradlew assembleRelease    # Para APK
./gradlew bundleRelease      # Para AAB (recomendado para Play Store)
```

## Reglas de Codificación

### Componentes
```typescript
interface Props {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyComponent;
```

### Hooks Personalizados
```typescript
const useAuth = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, login };
};
```

### Servicios API
```typescript
class ApiService {
  private baseURL = 'https://api.example.com';

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const apiService = new ApiService();
```

## Configuración de Metro

### metro.config.js
```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@utils': './src/utils',
      '@assets': './src/assets',
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
```

## Debugging y Testing

### Configuración de Flipper
```bash
pnpm add --dev react-native-flipper
```

### ESLint y Prettier
```bash
pnpm add --dev @react-native-community/eslint-config prettier eslint-plugin-prettier
```

#### .eslintrc.js
```javascript
module.exports = {
  root: true,
  extends: ['@react-native-community'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
```

## Performance y Optimización

### Reglas de Performance
- Usar `FlatList` para listas grandes
- Implementar `getItemLayout` cuando sea posible
- Usar `removeClippedSubviews` en listas largas
- Optimizar imágenes con `resizeMode`
- Implementar lazy loading para componentes pesados

### Gestión de Memoria
- Limpiar listeners en `useEffect` cleanup
- Evitar funciones anónimas en renders
- Usar `useMemo` y `useCallback` apropiadamente
- Implementar `React.memo` para componentes puros

## Configuración de Entorno Windows

### Variables de Entorno
```bash
ANDROID_HOME=C:\Users\USERNAME\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

### Path del Sistema
Agregar al PATH:
- `%ANDROID_HOME%\platform-tools`
- `%ANDROID_HOME%\tools`
- `%JAVA_HOME%\bin`

### Comandos PowerShell
```powershell
# Verificar instalación
Get-Command adb
Get-Command javac

# Listar dispositivos
adb devices

# Limpiar builds
Remove-Item -Recurse -Force android\app\build, node_modules\.cache
```

## Solución de Problemas Comunes

### Error: Unable to load script
```bash
pnpm start --reset-cache
```

### Error: SDK location not found
Crear `android/local.properties`:
```
sdk.dir=C\:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk
```

### Error: Duplicate resources
```bash
cd android
./gradlew clean
cd ..
pnpm android
```

### Error de permisos AdMob
Verificar que el Application ID esté correctamente configurado en AndroidManifest.xml

---

## Checklist Pre-Release

- [ ] Probar en dispositivos físicos
- [ ] Verificar que AdMob funciona correctamente
- [ ] Optimizar imágenes y assets
- [ ] Configurar ProGuard/R8
- [ ] Generar keystore de release
- [ ] Probar APK firmado
- [ ] Verificar permisos mínimos necesarios
- [ ] Documentar cambios en CHANGELOG.md