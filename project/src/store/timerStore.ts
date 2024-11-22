import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

interface TimerSession {
  id: string;
  duration: number;
  type: 'focus' | 'break';
  startTime: Date;
  endTime: Date;
  userId: string;
}

interface TimerSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface TimerStore {
  sessions: TimerSession[];
  settings: TimerSettings;
  totalFocusTime: number;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  addSession: (session: Omit<TimerSession, 'id' | 'userId'>) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25 * 60, // 25 minutes
  breakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsBeforeLongBreak: 4,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => {
      // Set up listener for auth state changes and timer sessions
      auth.onAuthStateChanged((user) => {
        if (user) {
          const q = query(
            collection(db, 'timerSessions'),
            where('userId', '==', user.uid)
          );

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              startTime: doc.data().startTime.toDate(),
              endTime: doc.data().endTime.toDate(),
            })) as TimerSession[];

            const totalFocusTime = sessions
              .filter(session => session.type === 'focus')
              .reduce((total, session) => total + session.duration, 0);

            set({ sessions, totalFocusTime, isLoading: false });
          });

          return () => unsubscribe();
        } else {
          set({ sessions: [], totalFocusTime: 0, isLoading: false });
        }
      });

      return {
        sessions: [],
        settings: DEFAULT_SETTINGS,
        totalFocusTime: 0,
        isLoading: true,

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings }
          }));
        },

        addSession: async (session) => {
          if (!auth.currentUser) return;
          await addDoc(collection(db, 'timerSessions'), {
            ...session,
            userId: auth.currentUser.uid,
            startTime: Timestamp.fromDate(session.startTime),
            endTime: Timestamp.fromDate(session.endTime),
          });
        },
      };
    },
    {
      name: 'timer-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);