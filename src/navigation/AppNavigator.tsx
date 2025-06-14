import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen, AddTodoScreen, EditTodoScreen} from '@/screens';
import {RootStackParamList} from '@/types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="AddTodo" 
          component={AddTodoScreen} 
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen 
          name="EditTodo" 
          component={EditTodoScreen} 
          options={{
            presentation: 'transparentModal',
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;