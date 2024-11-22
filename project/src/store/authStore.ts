import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Set up auth state listener
  onAuthStateChanged(auth, (user) => {
    set({ user, loading: false });
  });

  return {
    user: null,
    loading: true,
    error: null,
    signUp: async (email, password) => {
      try {
        set({ error: null, loading: true });
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        set({ error: error.message });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    signIn: async (email, password) => {
      try {
        set({ error: null, loading: true });
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        set({ error: error.message });
        throw error;
      } finally {
        set({ loading: false });
      }
    },
    signOut: async () => {
      try {
        set({ error: null, loading: true });
        await firebaseSignOut(auth);
      } catch (error: any) {
        set({ error: error.message });
        throw error;
      } finally {
        set({ loading: false });
      }
    }
  };
});