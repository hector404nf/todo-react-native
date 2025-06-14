import React, { useState, useEffect } from 'react';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface Props {
  style?: ViewStyle;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

const AdNative: React.FC<Props> = ({style, onAdLoaded, onAdFailedToLoad}) => {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.NATIVE
    : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

  useEffect(() => {
    const loadAd = async () => {
      try {
        const ad = await NativeAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true,
        });

        // Native ads don't need explicit load() call
        setNativeAd(ad);
        setLoaded(true);
        onAdLoaded?.();
        console.log('[AdMob] Native ad created');
      } catch (error) {
        console.error('[AdMob] Error creating native ad:', error);
        onAdFailedToLoad?.(error);
      }
    };

    loadAd();

    return () => {
      // Cleanup if needed
      setNativeAd(null);
      setLoaded(false);
    };
  }, [adUnitId, onAdLoaded, onAdFailedToLoad]);

  if (!loaded || !nativeAd) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Loading ad...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <NativeAdView nativeAd={nativeAd} style={styles.nativeAdView}>
          <View style={styles.adContent}>
            <View style={styles.adHeader}>
              <NativeAsset assetType={NativeAssetType.ICON}>
                <View style={styles.icon} />
              </NativeAsset>
              <View>
                <NativeAsset assetType={NativeAssetType.HEADLINE}>
                  <Text style={styles.headline} />
                </NativeAsset>
                <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                  <Text style={styles.advertiser} />
                </NativeAsset>
              </View>
            </View>
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.tagline} />
            </NativeAsset>
            <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
              <Text style={styles.callToAction} />
            </NativeAsset>
          </View>
        </NativeAdView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  placeholder: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  nativeAdView: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  adContent: {
    padding: 12,
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  adText: {
    flex: 1,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  advertiser: {
    fontSize: 12,
    color: '#666',
  },
  tagline: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  callToAction: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});

export default AdNative;