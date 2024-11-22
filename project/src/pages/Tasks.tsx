import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckSquare, Square, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { format } from 'date-fns';

function Tasks() {
  const { tasks, addTask, toggleTask, removeTask, updateTask } = useTaskStore();
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    addTask({
      title: newTask,
      completed: false,
      priority: 'medium',
      category: 'general',
      dueDate: new Date()
    });
    setNewTask('');
  };

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tasks</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
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
      </motion.div>

      <AnimatePresence>
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center gap-4"
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              {task.completed ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1">
              <span className={`text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <button
              onClick={() => removeTask(task.id)}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Tasks;