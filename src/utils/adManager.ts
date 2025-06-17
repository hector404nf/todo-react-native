import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración para evitar abuso de ads
const AD_CONFIG = {
  // Tiempo mínimo entre anuncios intersticiales (en milisegundos)
  INTERSTITIAL_COOLDOWN: 30 * 1000, // 30 segundos para testing
  // Tiempo mínimo entre anuncios rewarded (en milisegundos)
  REWARDED_COOLDOWN: 2 * 60 * 1000, // 2 minutos
  // Máximo de anuncios intersticiales por sesión
  MAX_INTERSTITIALS_PER_SESSION: 10, // Aumentado para testing
  // Máximo de anuncios rewarded por día
  MAX_REWARDED_PER_DAY: 5,
  // Acciones mínimas del usuario antes de mostrar intersticial
  MIN_ACTIONS_FOR_INTERSTITIAL: 3,
};

const STORAGE_KEYS = {
  LAST_INTERSTITIAL: 'lastInterstitialTime',
  LAST_REWARDED: 'lastRewardedTime',
  INTERSTITIAL_COUNT: 'interstitialCountToday',
  REWARDED_COUNT: 'rewardedCountToday',
  USER_ACTIONS: 'userActionsCount',
  LAST_RESET_DATE: 'lastResetDate',
};

class AdManager {
  private static instance: AdManager;
  private userActionsCount = 0;
  private initialized = false;

  static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  // Inicializar el AdManager cargando datos guardados
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const savedActions = await AsyncStorage.getItem(STORAGE_KEYS.USER_ACTIONS);
      this.userActionsCount = parseInt(savedActions || '0');
      console.log('[AdManager] Initialized with user actions:', this.userActionsCount);
      this.initialized = true;
    } catch (error) {
      console.error('[AdManager] Error initializing:', error);
      this.userActionsCount = 0;
      this.initialized = true;
    }
  }

  // Resetear contadores diarios
  private async resetDailyCountersIfNeeded(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const lastResetDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
      
      if (lastResetDate !== today) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.INTERSTITIAL_COUNT, '0'],
          [STORAGE_KEYS.REWARDED_COUNT, '0'],
          [STORAGE_KEYS.LAST_RESET_DATE, today],
        ]);
        console.log('[AdManager] Daily counters reset');
      }
    } catch (error) {
      console.error('[AdManager] Error resetting daily counters:', error);
    }
  }

  // Incrementar contador de acciones del usuario
  async incrementUserActions(): Promise<void> {
    await this.initialize();
    this.userActionsCount++;
    console.log('[AdManager] User actions incremented to:', this.userActionsCount);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ACTIONS, this.userActionsCount.toString());
    } catch (error) {
      console.error('[AdManager] Error saving user actions:', error);
    }
  }

  // Verificar si se puede mostrar anuncio intersticial
  async canShowInterstitial(): Promise<boolean> {
    try {
      await this.initialize();
      await this.resetDailyCountersIfNeeded();

      console.log('[AdManager] Checking interstitial availability...');

      // Verificar acciones mínimas del usuario
      if (this.userActionsCount < AD_CONFIG.MIN_ACTIONS_FOR_INTERSTITIAL) {
        console.log('[AdManager] Not enough user actions for interstitial. Current:', this.userActionsCount, 'Required:', AD_CONFIG.MIN_ACTIONS_FOR_INTERSTITIAL);
        return false;
      }
      
      console.log('[AdManager] User actions check passed. Current:', this.userActionsCount);

      // Verificar cooldown
      const lastInterstitialTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_INTERSTITIAL);
      if (lastInterstitialTime) {
        const timeSinceLastAd = Date.now() - parseInt(lastInterstitialTime);
        const cooldownRemaining = AD_CONFIG.INTERSTITIAL_COOLDOWN - timeSinceLastAd;
        console.log('[AdManager] Time since last interstitial:', Math.floor(timeSinceLastAd / 1000), 'seconds');
        if (timeSinceLastAd < AD_CONFIG.INTERSTITIAL_COOLDOWN) {
          console.log('[AdManager] Interstitial cooldown active. Remaining:', Math.floor(cooldownRemaining / 1000), 'seconds');
          return false;
        }
      } else {
        console.log('[AdManager] No previous interstitial found - cooldown passed');
      }

      // Verificar límite diario
      const interstitialCount = await AsyncStorage.getItem(STORAGE_KEYS.INTERSTITIAL_COUNT);
      const count = parseInt(interstitialCount || '0');
      console.log('[AdManager] Interstitial count today:', count, 'Max allowed:', AD_CONFIG.MAX_INTERSTITIALS_PER_SESSION);
      if (count >= AD_CONFIG.MAX_INTERSTITIALS_PER_SESSION) {
        console.log('[AdManager] Max interstitials per session reached');
        return false;
      }

      console.log('[AdManager] All checks passed - can show interstitial');
      return true;
    } catch (error) {
      console.error('[AdManager] Error checking interstitial availability:', error);
      return false;
    }
  }

  // Verificar si se puede mostrar anuncio rewarded
  async canShowRewarded(): Promise<boolean> {
    try {
      await this.resetDailyCountersIfNeeded();

      // Verificar cooldown
      const lastRewardedTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REWARDED);
      if (lastRewardedTime) {
        const timeSinceLastAd = Date.now() - parseInt(lastRewardedTime);
        if (timeSinceLastAd < AD_CONFIG.REWARDED_COOLDOWN) {
          console.log('[AdManager] Rewarded cooldown active');
          return false;
        }
      }

      // Verificar límite diario
      const rewardedCount = await AsyncStorage.getItem(STORAGE_KEYS.REWARDED_COUNT);
      const count = parseInt(rewardedCount || '0');
      if (count >= AD_CONFIG.MAX_REWARDED_PER_DAY) {
        console.log('[AdManager] Max rewarded ads per day reached');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[AdManager] Error checking rewarded availability:', error);
      return false;
    }
  }

  // Registrar que se mostró un anuncio intersticial
  async recordInterstitialShown(): Promise<void> {
    try {
      const now = Date.now().toString();
      const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.INTERSTITIAL_COUNT);
      const newCount = (parseInt(currentCount || '0') + 1).toString();
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_INTERSTITIAL, now],
        [STORAGE_KEYS.INTERSTITIAL_COUNT, newCount],
      ]);
      
      // Resetear contador de acciones
      this.userActionsCount = 0;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ACTIONS, '0');
      
      console.log('[AdManager] Interstitial ad recorded');
    } catch (error) {
      console.error('[AdManager] Error recording interstitial:', error);
    }
  }

  // Registrar que se mostró un anuncio rewarded
  async recordRewardedShown(): Promise<void> {
    try {
      const now = Date.now().toString();
      const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.REWARDED_COUNT);
      const newCount = (parseInt(currentCount || '0') + 1).toString();
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_REWARDED, now],
        [STORAGE_KEYS.REWARDED_COUNT, newCount],
      ]);
      
      console.log('[AdManager] Rewarded ad recorded');
    } catch (error) {
      console.error('[AdManager] Error recording rewarded:', error);
    }
  }

  // Resetear cooldown de anuncios intersticiales (para testing)
  async resetInterstitialCooldown(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_INTERSTITIAL);
      console.log('[AdManager] Interstitial cooldown reset - ads can show immediately');
    } catch (error) {
      console.error('[AdManager] Error resetting interstitial cooldown:', error);
    }
  }

  // Resetear todos los contadores y cooldowns (para testing)
  async resetAllAdData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LAST_INTERSTITIAL,
        STORAGE_KEYS.LAST_REWARDED,
        STORAGE_KEYS.INTERSTITIAL_COUNT,
        STORAGE_KEYS.REWARDED_COUNT,
        STORAGE_KEYS.USER_ACTIONS,
      ]);
      this.userActionsCount = 0;
      console.log('[AdManager] All ad data reset - fresh start for testing');
    } catch (error) {
      console.error('[AdManager] Error resetting all ad data:', error);
    }
  }

  // Obtener estadísticas de ads
  async getAdStats(): Promise<{
    interstitialCount: number;
    rewardedCount: number;
    userActions: number;
    canShowInterstitial: boolean;
    canShowRewarded: boolean;
  }> {
    try {
      await this.resetDailyCountersIfNeeded();
      
      const [interstitialCount, rewardedCount, userActions] = await AsyncStorage.multiGet([
        STORAGE_KEYS.INTERSTITIAL_COUNT,
        STORAGE_KEYS.REWARDED_COUNT,
        STORAGE_KEYS.USER_ACTIONS,
      ]);

      const stats = {
        interstitialCount: parseInt(interstitialCount[1] || '0'),
        rewardedCount: parseInt(rewardedCount[1] || '0'),
        userActions: parseInt(userActions[1] || '0'),
        canShowInterstitial: await this.canShowInterstitial(),
        canShowRewarded: await this.canShowRewarded(),
      };

      this.userActionsCount = stats.userActions;
      return stats;
    } catch (error) {
      console.error('[AdManager] Error getting ad stats:', error);
      return {
        interstitialCount: 0,
        rewardedCount: 0,
        userActions: 0,
        canShowInterstitial: false,
        canShowRewarded: false,
      };
    }
  }
}

export default AdManager.getInstance();
export {AD_CONFIG};