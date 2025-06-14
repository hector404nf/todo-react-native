import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

interface Props {
  onAdLoaded?: () => void;
  onAdClosed?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onUserEarnedReward?: (reward: {type: string; amount: number}) => void;
}

export interface AdRewardedRef {
  showAd: () => void;
  isLoaded: boolean;
}

const AdRewarded = forwardRef<AdRewardedRef, Props>(
  ({onAdLoaded, onAdClosed, onAdFailedToLoad, onUserEarnedReward}, ref) => {
    const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
    const [loaded, setLoaded] = useState(false);

    const adUnitId = __DEV__
      ? TestIds.REWARDED
      : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

    useEffect(() => {
      const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setLoaded(true);
          onAdLoaded?.();
          console.log('[AdMob] Rewarded ad loaded');
        },
      );

      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        reward => {
          console.log('[AdMob] User earned reward:', reward);
          onUserEarnedReward?.(reward);
        },
      );

      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          setLoaded(false);
          onAdClosed?.();
          console.log('[AdMob] Rewarded ad closed');
          // Preload next ad
          rewardedAd.load();
        },
      );

      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        error => {
          console.error('[AdMob] Error loading rewarded ad:', error);
          onAdFailedToLoad?.(error);
        },
      );

      setRewarded(rewardedAd);
      rewardedAd.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        unsubscribeError();
      };
    }, [adUnitId, onAdLoaded, onAdClosed, onAdFailedToLoad, onUserEarnedReward]);

    useImperativeHandle(ref, () => ({
      showAd: () => {
        if (loaded && rewarded) {
          rewarded.show();
        } else {
          console.warn('[AdMob] Rewarded ad not ready yet');
        }
      },
      isLoaded: loaded,
    }));

    // This component doesn't render anything visible
    return null;
  },
);

AdRewarded.displayName = 'AdRewarded';

export default AdRewarded;
export {AdRewarded};