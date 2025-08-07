"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- Icon Components ---
const PaperAirplaneIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /> </svg> );
const PaperClipIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /> </svg> );

export default function AIAssistant({ messages, onSendMessage, onFileUpload, isLoading }) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file, input);
      setInput('');
    }
    e.target.value = null;
  };

  return (
    // The container must be a flex column that fills its parent's height.
    <div className="flex flex-col h-full"> 
      
      {/* The message list grows to fill all available space. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-xl px-4 py-3 rounded-lg shadow-md ${msg.sender === 'ai' ? 'bg-gray-700' : 'bg-red-600'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </motion.div>
        ))}
         {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="max-w-xl px-4 py-2 rounded-lg bg-gray-700 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                </div>
            </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* The form does not grow or shrink, it stays at the bottom. */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 flex items-center p-4 border-t border-white/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "AI is thinking..." : "Add students from this file or ask a question..."}
          className="flex-1 bg-gray-700 text-white rounded-l-lg p-3 outline-none focus:ring-2 focus:ring-red-500 transition-all"
          disabled={isLoading}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv, .xlsx, .xls" />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-600 hover:bg-gray-500 text-white p-3"
          disabled={isLoading}
          title="Upload a .csv or .xlsx file"
        >
          <PaperClipIcon className="w-6 h-6" />
        </button>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-r-lg disabled:bg-gray-500"
          disabled={isLoading}
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}