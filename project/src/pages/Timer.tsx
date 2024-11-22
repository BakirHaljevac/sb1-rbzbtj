import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RefreshCw, Settings as SettingsIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { format } from 'date-fns';

function Timer() {
  const { settings, updateSettings, addSession, totalFocusTime } = useTimerStore();
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: number;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      new Audio('/notification.mp3').play().catch(() => {});
      
      // Record completed session
      if (sessionStartTime) {
        const endTime = new Date();
        addSession({
          duration: isBreak ? settings.breakDuration : settings.focusDuration,
          type: isBreak ? 'break' : 'focus',
          startTime: sessionStartTime,
          endTime,
        });
      }

      if (isBreak) {
        setTimeLeft(settings.focusDuration);
        setIsBreak(false);
      } else {
        setSessionCount((count) => count + 1);
        const isLongBreak = (sessionCount + 1) % settings.sessionsBeforeLongBreak === 0;
        setTimeLeft(isLongBreak ? settings.longBreakDuration : settings.breakDuration);
        setIsBreak(true);
      }
      setIsRunning(false);
      setSessionStartTime(null);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, settings, sessionCount, sessionStartTime, addSession]);

  const toggleTimer = useCallback(() => {
    if (!isRunning && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsRunning(!isRunning);
  }, [isRunning, sessionStartTime]);

  const resetTimer = useCallback(() => {
    setTimeLeft(settings.focusDuration);
    setIsRunning(false);
    setIsBreak(false);
    setSessionStartTime(null);
  }, [settings.focusDuration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTime = (type: 'focus' | 'break' | 'longBreak', change: number) => {
    const setting = type === 'focus' ? 'focusDuration' : 
                   type === 'break' ? 'breakDuration' : 'longBreakDuration';
    const newValue = Math.max(60, settings[setting] + change * 60);
    updateSettings({ [setting]: newValue });
    if (!isRunning && ((type === 'focus' && !isBreak) || (type !== 'focus' && isBreak))) {
      setTimeLeft(newValue);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
            <p className="text-gray-600">
              Session {sessionCount + 1} • Total Focus Time: {formatTime(totalFocusTime)}
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-semibold mb-4">Timer Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Focus Duration</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustTime('focus', -1)} className="p-1 hover:text-purple-600">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span>{formatTime(settings.focusDuration)}</span>
                  <button onClick={() => adjustTime('focus', 1)} className="p-1 hover:text-purple-600">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Break Duration</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustTime('break', -1)} className="p-1 hover:text-purple-600">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span>{formatTime(settings.breakDuration)}</span>
                  <button onClick={() => adjustTime('break', 1)} className="p-1 hover:text-purple-600">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Long Break Duration</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => adjustTime('longBreak', -1)} className="p-1 hover:text-purple-600">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span>{formatTime(settings.longBreakDuration)}</span>
                  <button onClick={() => adjustTime('longBreak', 1)} className="p-1 hover:text-purple-600">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="text-7xl font-bold text-purple-600 mb-8 text-center">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {sessionStartTime && (
          <div className="mt-6 text-center text-gray-600">
            Started at {format(sessionStartTime, 'HH:mm:ss')}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Timer;