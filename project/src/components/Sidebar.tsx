import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CheckSquare, StickyNote, Calendar, Timer, MessageSquare, Mic, Brain, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const menuItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/timer', icon: Timer, label: 'Timer' },
  { path: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { path: '/voice', icon: Mic, label: 'Voice Assistant' },
];

function Sidebar() {
  const { signOut } = useAuthStore();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Brain className="w-8 h-8 text-purple-600" />
        <span className="ml-2 text-xl font-semibold text-gray-800">ADHD Assistant</span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-150 ease-in-out hover:bg-purple-50 hover:text-purple-700 ${
                    isActive ? 'bg-purple-100 text-purple-700' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className={`w-5 h-5 ${
                        isActive ? 'text-purple-600' : 'text-gray-500'
                      }`} />
                    </motion.div>
                    <span className="ml-3 font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={signOut}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;