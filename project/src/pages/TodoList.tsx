import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Trash2, Edit, CheckSquare, Square } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { format } from 'date-fns';

function TodoList() {
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = useTodoStore();
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    addTodo({
      title: newTodo,
      completed: false,
      priority: 'medium',
      dueDate: new Date(),
    });
    setNewTodo('');
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Todo List</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </form>
      </div>

      <AnimatePresence>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center gap-4"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              {todo.completed ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1">
              {editingTodo === todo.id ? (
                <input
                  type="text"
                  value={todo.title}
                  onChange={(e) =>
                    updateTodo(todo.id, { title: e.target.value })
                  }
                  onBlur={() => setEditingTodo(null)}
                  autoFocus
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              ) : (
                <span
                  className={`text-gray-800 ${
                    todo.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {todo.title}
                </span>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${priorityColors[todo.priority]}`}>
                  {todo.priority}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {format(new Date(todo.dueDate!), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingTodo(todo.id)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default TodoList;