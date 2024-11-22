import { create } from 'zustand';
import OpenAI from 'openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

interface AIStore {
  messages: Message[];
  isProcessing: boolean;
  apiError: string | null;
  processUserInput: (input: string) => Promise<string>;
  clearMessages: () => void;
  clearError: () => void;
}

const FALLBACK_RESPONSES = [
  "I'm here to help with task management, organization, and daily activities.",
  "I can assist you with creating tasks, setting reminders, and managing your calendar.",
  "Let me help you stay organized and focused on what matters most.",
  "I understand ADHD can be challenging. I'm here to support you.",
  "Would you like me to help you break down this task into smaller, manageable steps?",
];

const getFallbackResponse = () => {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
};

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isProcessing: false,
  apiError: null,

  processUserInput: async (input: string) => {
    try {
      set({ isProcessing: true, apiError: null });
      const messages = get().messages;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input
      };
      set({ messages: [...messages, userMessage] });

      let assistantResponse: string;

      try {
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }

        const openai = new OpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for users with ADHD. Provide clear, concise responses and help with task management, organization, and daily activities.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        assistantResponse = completion.choices[0]?.message?.content || getFallbackResponse();
      } catch (error: any) {
        console.error('OpenAI API Error:', error);
        set({ apiError: error.message });
        assistantResponse = getFallbackResponse();
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantResponse,
        error: !import.meta.env.VITE_OPENAI_API_KEY
      };

      set({ messages: [...get().messages, assistantMessage] });
      return assistantResponse;
    } catch (error: any) {
      console.error('Error processing input:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getFallbackResponse(),
        error: true
      };
      set({ messages: [...get().messages, errorMessage] });
      return getFallbackResponse();
    } finally {
      set({ isProcessing: false });
    }
  },

  clearMessages: () => set({ messages: [], apiError: null }),
  clearError: () => set({ apiError: null })
}));