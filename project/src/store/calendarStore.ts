import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  userId: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set) => {
  // Set up listener for auth state changes and events
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate(),
        })) as CalendarEvent[];
        set({ events });
      });

      return () => unsubscribe();
    } else {
      set({ events: [] });
    }
  });

  return {
    events: [],
    addEvent: async (event) => {
      if (!auth.currentUser) return;
      await addDoc(collection(db, 'events'), {
        ...event,
        userId: auth.currentUser.uid,
        start: new Date(event.start),
        end: new Date(event.end),
      });
    },
    removeEvent: async (id) => {
      if (!auth.currentUser) return;
      await deleteDoc(doc(db, 'events', id));
    },
  };
});