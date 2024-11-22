import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  StickyNote, 
  Calendar, 
  Timer, 
  MessageSquare, 
  Mic,
  Clock,
  ListTodo
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useTimerStore } from '../store/timerStore';
import { format } from 'date-fns';

const features = [
  {
    title: 'Tasks',
    description: 'Organize and track your daily tasks',
    icon: CheckSquare,
    path: '/tasks',
    color: 'bg-blue-500'
  },
  {
    title: 'Quick Notes',
    description: 'Capture thoughts and ideas instantly',
    icon: StickyNote,
    path: '/notes',
    color: 'bg-green-500'
  },
  {
    title: 'Calendar',
    description: 'Schedule and manage your time',
    icon: Calendar,
    path: '/calendar',
    color: 'bg-purple-500'
  },
  {
    title: 'Focus Timer',
    description: 'Stay focused with Pomodoro technique',
    icon: Timer,
    path: '/timer',
    color: 'bg-red-500'
  },
  {
    title: 'Chat Assistant',
    description: 'Get help through text chat',
    icon: MessageSquare,
    path: '/chat',
    color: 'bg-indigo-500'
  },
  {
    title: 'Voice Assistant',
    description: 'Voice-controlled task management',
    icon: Mic,
    path: '/voice',
    color: 'bg-pink-500'
  }
];

function Dashboard() {
  const { tasks } = useTaskStore();
  const { totalFocusTime } = useTimerStore();

  const incompleteTasks = tasks.filter(task => !task.completed);
  const todaysTasks = incompleteTasks.filter(task => {
    const taskDate = new Date(task.dueDate!);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="mt-2 text-gray-600">Let's help you stay organized and focused today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ListTodo className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Today's Tasks</h2>
          </div>
          {todaysTasks.length > 0 ? (
            <ul className="space-y-2">
              {todaysTasks.slice(0, 3).map(task => (
                <li key={task.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700">{task.title}</span>
                </li>
              ))}
              {todaysTasks.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{todaysTasks.length - 3} more tasks
                </li>
              )}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks scheduled for today</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Focus Time</h2>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatTime(totalFocusTime)}
          </div>
          <p className="text-gray-600">Total focused work time</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={feature.path}>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;