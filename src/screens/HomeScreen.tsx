import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useTodos} from '@/context/TodoContext';
import TodoItem from '@/components/TodoItem';
import {AdBanner, AdInterstitial, AdRewarded, AdNative} from '@/components';
import AdManager from '@/utils/adManager';
import {RootStackParamList} from '@/types';
import React, {useRef, useEffect, useState} from 'react';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {todos, toggleTodo, deleteTodo} = useTodos();
  const interstitialRef = useRef<any>(null);
  const rewardedRef = useRef<any>(null);
  const [showNativeAd, setShowNativeAd] = useState(false);

  useEffect(() => {
    // Mostrar anuncio nativo si hay suficientes todos
    setShowNativeAd(todos.length >= 3);
  }, [todos.length]);

  const handleAddTodo = async () => {
    // Incrementar acciones del usuario
    await AdManager.incrementUserActions();
    navigation.navigate('AddTodo');
  };

  const handleEditTodo = async (todoId: string) => {
    // Incrementar acciones del usuario
    await AdManager.incrementUserActions();
    navigation.navigate('EditTodo', {todoId});
  };

  const handleToggleTodo = async (todoId: string) => {
    await AdManager.incrementUserActions();
    toggleTodo(todoId);
    
    // Mostrar intersticial después de completar tareas (ocasionalmente)
    const completedTodos = todos.filter(todo => todo.completed).length;
    if (completedTodos > 0 && completedTodos % 5 === 0) {
      const canShow = await AdManager.canShowInterstitial();
      if (canShow && interstitialRef.current?.isLoaded) {
        setTimeout(async () => {
          // Re-verificar si el anuncio sigue cargado después del delay
          if (interstitialRef.current?.isLoaded) {
            console.log('[AdMob] HomeScreen: Showing interstitial ad after todo completion');
            await interstitialRef.current.showAd();
            AdManager.recordInterstitialShown();
          } else {
            console.log('[AdMob] HomeScreen: Interstitial ad no longer loaded after delay');
          }
        }, 1000);
      }
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    await AdManager.incrementUserActions();
    deleteTodo(todoId);
  };

  const handleShowRewardedAd = async () => {
    const canShow = await AdManager.canShowRewarded();
    if (canShow && rewardedRef.current?.isLoaded) {
      rewardedRef.current?.showAd();
    } else {
      console.log('Rewarded ad not available right now');
    }
  };

  const handleInterstitialClosed = async () => {
    await AdManager.recordInterstitialShown();
  };

  const handleRewardedClosed = async () => {
    await AdManager.recordRewardedShown();
  };

  const handleUserEarnedReward = (reward: {type: string; amount: number}) => {
    console.log('User earned reward:', reward);
    // Aquí podrías implementar lógica de recompensas como:
    // - Desbloquear temas premium
    // - Dar puntos extra
    // - Quitar ads por un tiempo
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>⌕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AdBanner style={styles.adBanner} />

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIllustration}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyPersonEmoji}>🎉</Text>
          </View>
          <Text style={styles.emptyTitle}>Enjoy your day off</Text>
          <Text style={styles.emptySubtitle}>
            Rest and recharge your batteries -\nyou deserve it!
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Morning</Text>
          </View>
          <FlatList
            data={todos}
            keyExtractor={item => item.id}
            renderItem={({item, index}) => (
              <>
                <TodoItem
                  todo={item}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                />
                {/* Mostrar anuncio nativo cada 4 items */}
                {showNativeAd && index > 0 && (index + 1) % 4 === 0 && (
                  <AdNative
                    onAdLoaded={() => console.log('Native ad loaded')}
                    onAdFailedToLoad={(error) => console.log('Native ad failed:', error)}
                  />
                )}
              </>
            )}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddTodo}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Botón opcional para rewarded ads */}
      {completedCount >= 3 && (
        <TouchableOpacity 
          style={styles.rewardButton} 
          onPress={handleShowRewardedAd}
        >
          <Text style={styles.rewardButtonText}>🎁 Watch Ad for Rewards</Text>
        </TouchableOpacity>
      )}

      {/* Botones de testing para ads - Solo para desarrollo */}
      {__DEV__ && (
        <View style={styles.testingButtons}>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={async () => {
              await AdManager.resetInterstitialCooldown();
              console.log('✅ Cooldown de intersticial reseteado');
            }}
          >
            <Text style={styles.testButtonText}>Reset Cooldown</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, {backgroundColor: '#FF4444'}]} 
            onPress={async () => {
              await AdManager.resetAllAdData();
              console.log('✅ Todos los datos de ads reseteados');
            }}
          >
            <Text style={styles.testButtonText}>Reset All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, {backgroundColor: '#44AA44'}]} 
            onPress={async () => {
              const stats = await AdManager.getAdStats();
              console.log('📊 Ad Stats:', stats);
            }}
          >
            <Text style={styles.testButtonText}>Show Stats</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Componentes de ads invisibles */}
      <AdInterstitial
        ref={interstitialRef}
        onAdLoaded={() => console.log('Interstitial ad loaded')}
        onAdClosed={handleInterstitialClosed}
        onAdFailedToLoad={(error) => console.log('Interstitial ad failed:', error)}
      />
      
      <AdRewarded
        ref={rewardedRef}
        onAdLoaded={() => console.log('Rewarded ad loaded')}
        onAdClosed={handleRewardedClosed}
        onUserEarnedReward={handleUserEarnedReward}
        onAdFailedToLoad={(error) => console.log('Rewarded ad failed:', error)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FF6B47',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  searchButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '300',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: 'bold',
  },
  adBanner: {
    marginVertical: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 30,
  },
  emptyEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  emptyPersonEmoji: {
    fontSize: 40,
    position: 'absolute',
    top: -10,
    right: -20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  rewardButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rewardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  testingButtons: {
    position: 'absolute',
    bottom: 170,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HomeScreen;