import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TodoItem, TodoContextType} from '@/types';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const STORAGE_KEY = '@todoapp_todos';

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({children}) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Cargar todos desde AsyncStorage al inicializar
  useEffect(() => {
    loadTodos();
  }, []);

  // Guardar todos en AsyncStorage cuando cambien
  useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        setTodos(parsedTodos);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = (title: string, description?: string) => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {...todo, completed: !todo.completed, updatedAt: new Date()}
          : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id: string, title: string, description?: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? {...todo, title, description, updatedAt: new Date()}
          : todo,
      ),
    );
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};