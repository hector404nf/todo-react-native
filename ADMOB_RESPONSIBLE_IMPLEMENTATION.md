# Implementación Responsable de AdMob

## 📋 Tipos de Anuncios Implementados

### 1. **Banner Ads** 🏷️
- **Ubicación**: Parte superior de todas las pantallas
- **Frecuencia**: Siempre visible (no intrusivo)
- **Propósito**: Ingresos constantes sin interrumpir la experiencia

### 2. **Interstitial Ads** 📱
- **Ubicación**: Entre transiciones de pantalla
- **Frecuencia**: Controlada por AdManager
- **Triggers**:
  - Después de completar 5 tareas (HomeScreen)
  - Cada 3 tareas creadas (AddTodoScreen)
  - Cada 4 ediciones de tareas (EditTodoScreen)
- **Cooldown**: 3 minutos entre anuncios
- **Límite**: Máximo 3 por sesión

### 3. **Rewarded Ads** 🎁
- **Ubicación**: Botón opcional en HomeScreen
- **Frecuencia**: Solo cuando el usuario lo solicita
- **Requisito**: Aparece después de completar 3+ tareas
- **Cooldown**: 2 minutos entre anuncios
- **Límite**: Máximo 5 por día
- **Beneficios**: Recompensas para el usuario

### 4. **Native Ads** 📰
- **Ubicación**: Integrados en la lista de tareas
- **Frecuencia**: Cada 4 elementos en la lista
- **Condición**: Solo se muestran si hay 3+ tareas
- **Diseño**: Se integra naturalmente con el contenido

## 🛡️ Medidas Anti-Abuso

### Sistema AdManager
El `AdManager` implementa las siguientes protecciones:

#### **Cooldowns (Tiempo de Espera)**
```typescript
INTERSTITIAL_COOLDOWN: 3 * 60 * 1000, // 3 minutos
REWARDED_COOLDOWN: 2 * 60 * 1000,     // 2 minutos
```

#### **Límites de Frecuencia**
```typescript
MAX_INTERSTITIALS_PER_SESSION: 3,     // Máximo por sesión
MAX_REWARDED_PER_DAY: 5,               // Máximo por día
MIN_ACTIONS_FOR_INTERSTITIAL: 3,      // Acciones mínimas requeridas
```

#### **Tracking de Acciones del Usuario**
- Se incrementa con cada acción significativa:
  - Crear tarea
  - Editar tarea
  - Completar tarea
  - Eliminar tarea
  - Navegar entre pantallas

#### **Reset Automático**
- Los contadores se resetean automáticamente cada día
- Previene acumulación de límites

## 📊 Estrategia de Monetización Responsable

### **Principios Seguidos**

1. **User Experience First**
   - Los ads nunca interrumpen tareas críticas
   - Delays apropiados antes de mostrar intersticiales
   - Opciones claras para rewarded ads

2. **Frecuencia Controlada**
   - Cooldowns entre ads del mismo tipo
   - Límites diarios y por sesión
   - Basado en acciones del usuario, no tiempo

3. **Contextual Relevance**
   - Intersticiales después de completar acciones
   - Native ads integrados en contenido
   - Rewarded ads como beneficio opcional

4. **Compliance con Políticas**
   - Uso de TestIds durante desarrollo
   - No clicks accidentales
   - Respeto a las guidelines de Google

## 🔧 Configuración Técnica

### **IDs de Prueba (Desarrollo)**
```typescript
const adUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';
```

### **Request Options**
```typescript
requestOptions={{
  requestNonPersonalizedAdsOnly: true,
}}
```

### **Event Handling**
- Logging detallado para debugging
- Manejo de errores graceful
- Callbacks para tracking de performance

## 📈 Métricas y Monitoreo

### **Logs Implementados**
```typescript
console.log('[AdMob] Interstitial ad loaded');
console.log('[AdManager] Daily counters reset');
console.log('[AdManager] Not enough user actions for interstitial');
```

### **Estadísticas Disponibles**
```typescript
const stats = await AdManager.getAdStats();
// Retorna:
// - interstitialCount
// - rewardedCount  
// - userActions
// - canShowInterstitial
// - canShowRewarded
```

## 🚀 Beneficios de esta Implementación

### **Para el Usuario**
- Experiencia no intrusiva
- Recompensas por ver ads voluntariamente
- Ads relevantes y bien integrados
- Control sobre cuándo ver rewarded ads

### **Para el Desarrollador**
- Cumplimiento con políticas de AdMob
- Reducción de riesgo de suspensión
- Métricas claras de performance
- Fácil mantenimiento y debugging

### **Para la Monetización**
- Ingresos sostenibles a largo plazo
- Mayor engagement del usuario
- Mejor eCPM por ads de calidad
- Diversificación de formatos de ad

## ⚠️ Consideraciones Importantes

1. **Siempre usar TestIds en desarrollo**
2. **Configurar IDs reales solo en producción**
3. **Monitorear métricas de AdMob regularmente**
4. **Ajustar frecuencias basado en feedback de usuarios**
5. **Mantener logs para debugging de issues**

## 🔄 Próximos Pasos

1. **Testing Extensivo**
   - Probar todos los escenarios de ads
   - Verificar cooldowns y límites
   - Validar UX en diferentes dispositivos

2. **Configuración de Producción**
   - Crear Ad Units en AdMob Console
   - Reemplazar TestIds con IDs reales
   - Configurar targeting y filtros

3. **Monitoreo Post-Launch**
   - Revisar métricas de fill rate
   - Analizar feedback de usuarios
   - Optimizar frecuencias si es necesario

Esta implementación garantiza una monetización responsable que respeta tanto las políticas de AdMob como la experiencia del usuario, maximizando los ingresos de manera sostenible.