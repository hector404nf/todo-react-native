# Configuración de Dispositivos de Prueba para AdMob

Este documento explica cómo configurar dispositivos físicos como dispositivos de prueba para AdMob y cómo exportar la aplicación en formato APK con anuncios de prueba.

## Índice

1. [Configuración de Dispositivos de Prueba](#configuración-de-dispositivos-de-prueba)
2. [Exportar APK con Anuncios de Prueba](#exportar-apk-con-anuncios-de-prueba)
3. [Verificación de Anuncios de Prueba](#verificación-de-anuncios-de-prueba)

## Configuración de Dispositivos de Prueba

Para configurar un dispositivo físico como dispositivo de prueba, sigue estos pasos:

### 1. Obtener el ID del Dispositivo

1. Conecta tu dispositivo físico al ordenador y asegúrate de que la depuración USB está habilitada.
2. Ejecuta la aplicación en modo debug en tu dispositivo físico:
   ```bash
   npx react-native run-android
   ```
3. Una vez que la aplicación esté ejecutándose, abre el logcat para ver los logs:
   ```bash
   adb logcat -s "Ads"
   ```
4. Busca un mensaje similar a este:
   ```
   I/Ads: Use RequestConfiguration.Builder.setTestDeviceIds(Arrays.asList("33BE2250B43518CCDA7DE426D04EE231"))
   to get test ads on this device.
   ```
5. Copia el ID del dispositivo (en este ejemplo: `33BE2250B43518CCDA7DE426D04EE231`).

### 2. Agregar el ID a la Configuración

1. Abre el archivo `src/utils/adMobConfig.ts`.
2. Agrega el ID del dispositivo a la lista `TEST_DEVICE_IDS`:
   ```typescript
   export const TEST_DEVICE_IDS = [
     "33BE2250B43518CCDA7DE426D04EE231", // Reemplaza con tu ID real
   ];
   ```
3. Guarda el archivo.

## Exportar APK con Anuncios de Prueba

Para exportar la aplicación en formato APK con anuncios de prueba, sigue estos pasos:

### 1. Generar una Clave de Firma (si no la tienes)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar la Clave en el Proyecto

1. Crea un archivo `android/gradle.properties` (si no existe) y agrega:
   ```
   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=my-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=*****
   MYAPP_RELEASE_KEY_PASSWORD=*****
   ```

2. Edita `android/app/build.gradle` para configurar la firma:
   ```gradle
   android {
       ...
       defaultConfig { ... }
       signingConfigs {
           release {
               storeFile file(MYAPP_RELEASE_STORE_FILE)
               storePassword MYAPP_RELEASE_STORE_PASSWORD
               keyAlias MYAPP_RELEASE_KEY_ALIAS
               keyPassword MYAPP_RELEASE_KEY_PASSWORD
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

### 3. Generar el APK de Release

```bash
cd android
./gradlew assembleRelease
```

El APK generado se encontrará en `android/app/build/outputs/apk/release/app-release.apk`.

## Verificación de Anuncios de Prueba

Para verificar que los anuncios de prueba funcionan correctamente:

1. Instala el APK en tu dispositivo físico configurado como dispositivo de prueba.
2. Abre la aplicación y verifica que los anuncios muestren la etiqueta "Test Ad" en la parte superior.
3. Los anuncios de prueba se pueden hacer clic de forma segura sin generar cargos ni actividad inválida en tu cuenta de AdMob.

### Notas Importantes

- Los anuncios de prueba solo se mostrarán en los dispositivos configurados como dispositivos de prueba.
- Para los anuncios nativos, la etiqueta "Test Ad" aparecerá en el título del anuncio.
- Los anuncios mediados (de redes de terceros) pueden no mostrar la etiqueta "Test Ad".
- Asegúrate de que tu dispositivo esté conectado a Internet para recibir anuncios de prueba.

---

Esta configuración permite probar anuncios en dispositivos físicos con un APK de release sin riesgo de generar actividad inválida en tu cuenta de AdMob.