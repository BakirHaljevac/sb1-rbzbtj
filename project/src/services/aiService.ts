import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are an AI assistant specialized in helping users with ADHD. Your responses should be:
- Clear and concise
- Well-structured
- Action-oriented
- Encouraging and supportive

You can perform actions like:
- Creating todo items
- Adding calendar events
- Creating sticky notes
- Setting reminders

When a user requests an action, respond with both the action details and a confirmation message.`;

export interface AIResponse {
  message: string;
  actions?: {
    type: 'todo' | 'calendar' | 'note';
    data: any;
  }[];
}

export async function getAIResponse(userMessage: string, messageHistory: any[]): Promise<AIResponse> {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    
    // Parse actions from response if any
    const actions = parseActionsFromResponse(response);

    return {
      message: response,
      actions
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

function parseActionsFromResponse(response: string): any[] {
  const actions = [];
  
  // Example action parsing:
  if (response.includes('CREATE_TODO:')) {
    const todoMatch = response.match(/CREATE_TODO: (.*?)(?:\n|$)/);
    if (todoMatch) {
      actions.push({
        type: 'todo',
        data: { title: todoMatch[1] }
      });
    }
  }

  if (response.includes('CREATE_NOTE:')) {
    const noteMatch = response.match(/CREATE_NOTE: (.*?)(?:\n|$)/);
    if (noteMatch) {
      actions.push({
        type: 'note',
        data: { content: noteMatch[1] }
      });
    }
  }

  if (response.includes('CREATE_EVENT:')) {
    const eventMatch = response.match(/CREATE_EVENT: (.*?)(?:\n|$)/);
    if (eventMatch) {
      actions.push({
        type: 'calendar',
        data: { title: eventMatch[1] }
      });
    }
  }

  return actions;
}

// Speech synthesis utility
export function speakText(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  speechSynthesis.speak(utterance);
}