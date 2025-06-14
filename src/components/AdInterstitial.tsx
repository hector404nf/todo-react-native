import React, {useEffect, useState, useImperativeHandle, forwardRef} from 'react';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import {Alert} from 'react-native';

interface Props {
  onAdLoaded?: () => void;
  onAdClosed?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdReloading?: () => void;
}

export interface AdInterstitialRef {
  showAd: () => Promise<void>;
  isLoaded: boolean;
}

const AdInterstitial = forwardRef<AdInterstitialRef, Props>(
  ({onAdLoaded, onAdClosed, onAdFailedToLoad, onAdReloading}, ref) => {
    const [interstitial, setInterstitial] = useState<InterstitialAd | null>(
      null,
    );
    const [loaded, setLoaded] = useState(false);
  
  // Log para rastrear cambios de estado
  useEffect(() => {
    console.log('[AdMob] State changed - loaded:', loaded);
  }, [loaded]);

    const adUnitId = __DEV__
      ? TestIds.INTERSTITIAL
      : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

    useEffect(() => {
      let unsubscribeLoaded: (() => void) | undefined;
      let unsubscribeClosed: (() => void) | undefined;
      let unsubscribeError: (() => void) | undefined;

      const loadAd = async () => {
        try {
          const interstitialAd = await InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
          });

          unsubscribeLoaded = interstitialAd.addAdEventListener(
            AdEventType.LOADED,
            () => {
              console.log('[AdMob] LOADED event fired - setting loaded to true');
              setLoaded(true);
              onAdLoaded?.();
              console.log('[AdMob] Interstitial ad loaded successfully');
            },
          );

          unsubscribeClosed = interstitialAd.addAdEventListener(
            AdEventType.CLOSED,
            () => {
              console.log('[AdMob] CLOSED event fired - setting loaded to false');
              setLoaded(false);
              onAdClosed?.();
              console.log('[AdMob] Interstitial ad closed');
              // Preload next ad
              console.log('[AdMob] Preloading next interstitial ad');
              interstitialAd.load();
            },
          );

          unsubscribeError = interstitialAd.addAdEventListener(
            AdEventType.ERROR,
            error => {
              console.error('[AdMob] ERROR event fired:', error);
              console.log('[AdMob] Setting loaded to false due to error');
              setLoaded(false);
              
              // Manejo específico para errores de red
              if (error.message && error.message.includes('network-error')) {
                console.warn('[AdMob] Network error detected. Will retry loading in 5 seconds...');
                setTimeout(() => {
                  if (interstitialAd) {
                    console.log('[AdMob] Retrying ad load after network error');
                    interstitialAd.load();
                  }
                }, 5000);
              }
              
              onAdFailedToLoad?.(error);
            },
          );

          setInterstitial(interstitialAd);
          interstitialAd.load();
        } catch (error) {
          console.error('[AdMob] Error creating interstitial ad:', error);
          onAdFailedToLoad?.(error);
        }
      };

      console.log('[AdMob] Component mounted - initializing ad');
      loadAd();

      return () => {
        console.log('[AdMob] Component unmounting - cleaning up');
        unsubscribeLoaded?.();
        unsubscribeClosed?.();
        unsubscribeError?.();
      };
    }, [adUnitId, onAdLoaded, onAdClosed, onAdFailedToLoad]);

    useImperativeHandle(ref, () => {
      // Usar solo el estado local como recomienda la documentación oficial
      console.log('[AdMob] isLoaded check - Using local loaded state:', loaded);
      
      return {
        showAd: async () => {
          console.log('[AdMob] showAd called - Local loaded state:', loaded);
          
          if (!interstitial) {
            console.warn('[AdMob] Interstitial ad instance not available');
            return;
          }

          // Usar solo el estado local como en la documentación oficial
          if (!loaded) {
            console.warn('[AdMob] Interstitial ad not loaded according to local state:', loaded);
            // Intentar cargar si no está cargado
            try {
              console.log('[AdMob] Attempting to reload interstitial ad');
              interstitial.load();
            } catch (loadError) {
              console.error('[AdMob] Error loading interstitial ad:', loadError);
            }
            return;
          }

          // Verificación adicional: comprobar también el estado interno del anuncio
          if (!interstitial.loaded) {
            console.warn('[AdMob] Local state says loaded but interstitial.loaded is false. Reloading...');
            setLoaded(false);
            onAdReloading?.(); // Notificar que se está recargando
            try {
              interstitial.load();
            } catch (loadError) {
              console.error('[AdMob] Error reloading interstitial ad:', loadError);
            }
            return;
          }

          try {
            console.log('[AdMob] Attempting to show interstitial ad - both states are loaded');
            await interstitial.show();
            console.log('[AdMob] Interstitial ad shown successfully');
          } catch (error) {
            console.error('[AdMob] Error showing interstitial ad:', error);
            // Marcar como no cargado y recargar
            setLoaded(false);
            try {
              interstitial.load();
            } catch (reloadError) {
              console.error('[AdMob] Error reloading interstitial ad:', reloadError);
            }
          }
        },
        isLoaded: loaded,
      };
    });

    // This component doesn't render anything visible
    return null;
  },
);

AdInterstitial.displayName = 'AdInterstitial';

export default AdInterstitial;
export {AdInterstitial};