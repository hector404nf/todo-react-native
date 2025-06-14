import React from 'react';
import {StatusBar} from 'react-native';
import {TodoProvider} from '@/context/TodoContext';
import {AppNavigator} from '@/navigation';

const App: React.FC = () => {
  return (
    <TodoProvider>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <AppNavigator />
    </TodoProvider>
  );
};

export default App;
