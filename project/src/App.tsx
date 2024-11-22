import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import Timer from './pages/Timer';
import ChatAssistant from './pages/ChatAssistant';
import VoiceAssistant from './pages/VoiceAssistant';
import Auth from './pages/Auth';
import PrivateRoute from './components/PrivateRoute';
import { analytics } from './lib/firebase';

function App() {
  useEffect(() => {
    const initAnalytics = async () => {
      await analytics();
    };
    initAnalytics();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <motion.main
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 overflow-auto"
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/timer" element={<Timer />} />
                    <Route path="/chat" element={<ChatAssistant />} />
                    <Route path="/voice" element={<VoiceAssistant />} />
                  </Routes>
                </motion.main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;