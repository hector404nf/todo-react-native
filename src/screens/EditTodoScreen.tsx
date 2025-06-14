import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {useTodos} from '@/context/TodoContext';
import {useKeyboard} from '@/hooks/useKeyboard';
import {AdBanner, AdInterstitial} from '../components';
import AdManager from '@/utils/adManager';
import {useRef} from 'react';
import { RootStackParamList } from '../types';
import { RouteProp } from '@react-navigation/native';

type EditTodoScreenRouteProp = RouteProp<RootStackParamList, 'EditTodo'>;

const EditTodoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditTodoScreenRouteProp>();
  const {todos, updateTodo} = useTodos();
  const {keyboardHeight} = useKeyboard();
  const interstitialRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [editsCount, setEditsCount] = useState(0);
  const screenHeight = Dimensions.get('window').height;

  const {todoId} = route.params;
  const todo = todos.find(t => t.id === todoId);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setOriginalTitle(todo.title);
      setOriginalDescription(todo.description || '');
    }
  }, [todo]);



  const handleSave = async () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    updateTodo(todoId, title.trim(), description.trim() || undefined);
    
    // Incrementar acciones del usuario
    await AdManager.incrementUserActions();
    
    // Incrementar contador de ediciones
    const newCount = editsCount + 1;
    setEditsCount(newCount);
    
    // Mostrar intersticial cada 4 ediciones
    if (newCount % 4 === 0) {
      const canShow = await AdManager.canShowInterstitial();
      if (canShow && interstitialRef.current?.isLoaded) {
        setTimeout(async () => {
          // Re-verificar si el anuncio sigue cargado después del delay
          if (interstitialRef.current?.isLoaded) {
            console.log('[AdMob] EditTodoScreen: Showing interstitial ad after todo update');
            await interstitialRef.current.showAd();
            AdManager.recordInterstitialShown();
          } else {
            console.log('[AdMob] EditTodoScreen: Interstitial ad no longer loaded after delay');
          }
          navigation.goBack();
        }, 1000); // Delay para mejor UX
      } else {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };
  
  const handleInterstitialClosed = async () => {
    await AdManager.recordInterstitialShown();
  };

  const handleCancel = () => {
    const hasChanges = 
      title.trim() !== originalTitle || 
      description.trim() !== originalDescription;

    if (hasChanges) {
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

  if (!todo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tarea no encontrada</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      
      {/* Background overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleCancel}
      />
      
      <KeyboardAvoidingView
        style={[styles.keyboardContainer, {
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 60 : 30
        }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
                placeholder="Edit To-Do"
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
      </KeyboardAvoidingView>
      </View>
      
      <View style={styles.adBanner}>
        <AdBanner />
      </View>
      
      {/* Componente de ad intersticial invisible */}
      <AdInterstitial
        ref={interstitialRef}
        onAdLoaded={() => console.log('Interstitial ad loaded in EditTodo')}
        onAdClosed={handleInterstitialClosed}
        onAdFailedToLoad={(error) => console.log('Interstitial ad failed in EditTodo:', error)}
      />
    </>  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  },
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    zIndex: 1001,
  },
  modalContainer: {
    justifyContent: 'flex-end',
    zIndex: 1002,
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
    maxHeight: '95%',
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
    minHeight: 200,
    maxHeight: 200,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditTodoScreen;