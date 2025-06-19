import { RequestConfiguration } from 'react-native-google-mobile-ads';

/**
 * Configuración de AdMob para dispositivos de prueba
 * 
 * Este archivo configura los dispositivos de prueba para AdMob,
 * permitiendo mostrar anuncios de prueba en dispositivos físicos
 * incluso en builds de release.
 */

/**
 * Lista de IDs de dispositivos de prueba
 * 
 * Para obtener el ID de tu dispositivo físico:
 * 1. Ejecuta la app en modo debug en tu dispositivo
 * 2. Busca en el logcat un mensaje como:
 *    "Use RequestConfiguration.Builder.setTestDeviceIds(Arrays.asList("ABCDEF..."))"
 * 3. Copia ese ID y agrégalo a esta lista
 */
export const TEST_DEVICE_IDS = [
  // Agrega aquí los IDs de tus dispositivos físicos de prueba
  // Ejemplo: "33BE2250B43518CCDA7DE426D04EE231"
];

/**
 * Configuración de solicitudes de anuncios
 * Esta configuración se aplicará a todas las solicitudes de anuncios
 */
export const adMobRequestConfig: RequestConfiguration = {
  // Configura los dispositivos de prueba
  testDeviceIds: TEST_DEVICE_IDS,
  
  // Otras configuraciones opcionales
  // maxAdContentRating: 'G',
  // tagForChildDirectedTreatment: false,
  // tagForUnderAgeOfConsent: false,
};