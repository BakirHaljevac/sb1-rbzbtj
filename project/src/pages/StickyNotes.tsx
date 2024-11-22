import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';

const colors = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-purple-200',
  'bg-pink-200',
];

function StickyNotes() {
  const { notes, addNote, updateNote, removeNote } = useNoteStore();
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    addNote({
      content: newNoteContent,
      color: colors[Math.floor(Math.random() * colors.length)],
      position: {
        x: Math.random() * (window.innerWidth - 200),
        y: Math.random() * (window.innerHeight - 200),
      },
    });
    setNewNoteContent('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Sticky Notes</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Add a new note..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`${note.color} p-4 rounded-lg shadow-sm relative min-h-[200px]`}
              whileHover={{ scale: 1.02 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, { content: e.target.value })}
                className="w-full h-full bg-transparent resize-none focus:outline-none"
                style={{ minHeight: '150px' }}
              />
              <button
                onClick={() => removeNote(note.id)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 right-2 text-xs text-gray-600">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default StickyNotes;