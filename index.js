/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import mobileAds from 'react-native-google-mobile-ads';
import {adMobRequestConfig} from './src/utils/adMobConfig';

// Inicializar MobileAds con la configuración de dispositivos de prueba
mobileAds()
  .setRequestConfiguration(adMobRequestConfig)
  .then(() => {
    console.log('[AdMob] Configuración de dispositivos de prueba aplicada');
    return mobileAds().initialize();
  })
  .then(() => {
    console.log('[AdMob] SDK inicializado correctamente');
  })
  .catch(error => {
    console.error('[AdMob] Error al inicializar:', error);
  });

AppRegistry.registerComponent(appName, () => App);
