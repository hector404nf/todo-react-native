import React from 'react';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import {View, StyleSheet} from 'react-native';

interface Props {
  size?: BannerAdSize;
  style?: any;
}

const AdBanner: React.FC<Props> = ({size = BannerAdSize.BANNER, style}) => {
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdBanner;