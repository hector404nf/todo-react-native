import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {TodoItem as TodoItemType} from '@/types';

interface Props {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const TodoItem: React.FC<Props> = ({todo, onToggle, onDelete, onEdit}) => {
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Tarea',
      '¿Estás seguro de que quieres eliminar esta tarea?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Eliminar', style: 'destructive', onPress: () => onDelete(todo.id)},
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
        onPress={() => onToggle(todo.id)}>
        {todo.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.content} onPress={() => onEdit(todo.id)}>
        <Text style={[styles.title, todo.completed && styles.titleCompleted]}>
          {todo.title}
        </Text>
        {todo.description && (
          <Text style={[styles.description, todo.completed && styles.descriptionCompleted]}>
            {todo.description}
          </Text>
        )}
        <View style={styles.metaInfo}>
          <Text style={styles.time}>
            {todo.createdAt.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
          <Text style={styles.category}>@reading</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.inboxButton}>
        <Text style={styles.inboxText}>📥 Inbox</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6B47',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxCompleted: {
    backgroundColor: '#FF6B47',
    borderColor: '#FF6B47',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    lineHeight: 20,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: '#999999',
  },
  inboxButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  inboxText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default TodoItem;