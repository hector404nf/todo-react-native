import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Dimensions,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTodos} from '@/context/TodoContext';
import {useKeyboard} from '@/hooks/useKeyboard';
import {AdBanner, AdInterstitial} from '../components';
import AdManager from '@/utils/adManager';

const AddTodoScreen: React.FC = () => {
  const navigation = useNavigation();
  const {addTodo} = useTodos();
  const {keyboardHeight} = useKeyboard();
  const interstitialRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todosCreated, setTodosCreated] = useState(0);
  const screenHeight = Dimensions.get('window').height;



  const handleSave = async () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    addTodo(title.trim(), description.trim());
    
    // Incrementar acciones del usuario
    await AdManager.incrementUserActions();
    
    // Obtener las estadísticas actuales del AdManager
    const stats = await AdManager.getAdStats();
    
    // Mostrar intersticial cada 3 tareas creadas (usando las acciones del AdManager)
    if (stats.userActions % 3 === 0) {
      console.log('[AdMob] AddTodoScreen: Checking if can show interstitial (3rd task created)');
      const canShow = await AdManager.canShowInterstitial();
      if (canShow) {
        await showInterstitialWithAutoReload();
      } else {
        console.log('[AdMob] AddTodoScreen: Cannot show interstitial - conditions not met');
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  // Estado para manejar la recarga del anuncio
  const [isAdReloading, setIsAdReloading] = useState(false);

  // Callback cuando el anuncio comienza a recargarse
  const handleAdReloading = () => {
    console.log('[AdMob] AddTodoScreen: Ad is reloading due to desync');
    setIsAdReloading(true);
  };

  // Callback cuando el anuncio se carga exitosamente
  const handleAdLoaded = () => {
    console.log('[AdMob] AddTodoScreen: Ad loaded successfully');
    setIsAdReloading(false);
  };

  // Función para mostrar intersticial con manejo automático de recarga
  const showInterstitialWithAutoReload = async () => {
    const maxWaitTime = 15000; // 15 segundos máximo
    const checkInterval = 300; // Verificar cada 300ms
    let waitTime = 0;

    const attemptToShow = async (): Promise<boolean> => {
      if (!interstitialRef.current) {
        console.log('[AdMob] AddTodoScreen: Interstitial ref not available');
        return false;
      }

      // Si el anuncio está cargado, intentar mostrarlo
      if (interstitialRef.current.isLoaded && !isAdReloading) {
        try {
          console.log('[AdMob] AddTodoScreen: Attempting to show interstitial ad');
          await interstitialRef.current.showAd();
          await AdManager.recordInterstitialShown();
          console.log('[AdMob] AddTodoScreen: Interstitial ad shown successfully');
          return true;
        } catch (error) {
          console.log('[AdMob] AddTodoScreen: Error showing interstitial:', error);
          return false;
        }
      }

      // Si no está cargado o se está recargando, esperar
      
      return new Promise((resolve) => {
        const checkReady = () => {
          waitTime += checkInterval;
          
          if (waitTime >= maxWaitTime) {
            console.log('[AdMob] AddTodoScreen: Timeout waiting for ad to be ready');
            resolve(false);
            return;
          }
          
          if (interstitialRef.current?.isLoaded && !isAdReloading) {
            console.log('[AdMob] AddTodoScreen: Ad is now ready, attempting to show');
            attemptToShow().then(resolve);
          } else {
            setTimeout(checkReady, checkInterval);
          }
        };
        
        // Iniciar el primer intento inmediatamente
        setTimeout(checkReady, checkInterval);
      });
    };

    const success = await attemptToShow();
    
    // Navegar de vuelta después de un pequeño delay
    setTimeout(() => {
      navigation.goBack();
    }, success ? 1000 : 500);
  };
  
  const handleInterstitialClosed = async () => {
    await AdManager.recordInterstitialShown();
  };

  const handleCancel = () => {
    if (title.trim() !== '' || description.trim() !== '') {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro de que quieres descartar los cambios?',
        [
          {text: 'Continuar editando', style: 'cancel'},
          {text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack()},
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      
      {/* Background overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleCancel}
      />
      
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="New To-Do"
              placeholderTextColor="#CCCCCC"
              autoFocus
            />
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#CCCCCC"
              multiline
            />
          </View>

          <View style={styles.toolbar}>
            <View style={styles.toolbarLeft}>
              <TouchableOpacity style={styles.toolButton}>
                <Text style={styles.toolButtonText}>#</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton}>
                <Text style={styles.toolButtonText}>⏰</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton}>
                <Text style={styles.toolButtonText}>☰</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton}>
                <Text style={styles.toolButtonText}>⎘</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.toolbarRight}>
              <TouchableOpacity style={styles.inboxButton}>
                <Text style={styles.inboxButtonText}>⌂ Inbox</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
      {/* Ad Banner positioned outside modal */}
      {/* <View style={styles.adBanner}>
        <AdBanner />
      </View> */}
      
      {/* Componente de ad intersticial invisible */}
      <AdInterstitial
        ref={interstitialRef}
        onAdLoaded={handleAdLoaded}
        onAdClosed={handleInterstitialClosed}
        onAdFailedToLoad={(error) => console.log('[AdMob] AddTodoScreen: Interstitial ad failed:', error)}
        onAdReloading={handleAdReloading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end', // Alinear contenido en la parte inferior
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    zIndex: 1001,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    zIndex: 1002,
    marginBottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -5},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
    fontWeight: '300',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#666666',
    paddingVertical: 8,
    minHeight: 60,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    position: 'relative',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1003,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  toolButtonText: {
    fontSize: 18,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inboxButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E8F0',
    marginRight: 12,
  },
  inboxButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B47',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  adBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 999,
  },
});

export default AddTodoScreen;