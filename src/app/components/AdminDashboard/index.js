'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

// Import sub-components
import Sidebar from './Sidebar';
import AIAssistant from './AIAssistant';
import TableViewer from './TableViewer';
import SqlEditor from './SqlEditor';

const AdminDashboard = ({ user, profile, signOut }) => {
  const [activeView, setActiveView] = useState('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your secure SQL assistant. How can I help you query the database today?", sender: 'ai' }
  ]);
  const [queryResults, setQueryResults] = useState({ query: '', data: [] });
  const [isChatOpen, setIsChatOpen] = useState(true);

  // API handler
  const sendApiCommand = async (action, payload) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'API request failed');
      return result;
    } catch (err) {
      toast.error(err.message);
      setMessages(prev => [...prev, { text: `⚠️ Error: ${err.message}`, sender: 'ai' }]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending messages
  const handleSendMessage = async (message) => {
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    const response = await sendApiCommand('user-command', { command: message });
    if (response) handleApiResponse(response);
  };

  // Handle API responses
  const handleApiResponse = (response) => {
    if (!response) return;

    const { status, message, data, query } = response;
    
    switch (status) {
      case 'query_result':
        setMessages(prev => [...prev, { text: message || "Here are the results for your query.", sender: 'ai' }]);
        setQueryResults({ query, data: data || [] });
        setActiveView('tables');
        break;
      // Add more cases as needed
      default:
        setMessages(prev => [...prev, { text: message || 'Operation completed', sender: 'ai' }]);
    }
  };

  // Toggle chat visibility
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  // Render the current view
  const renderView = () => {
    switch (activeView) {
      case 'ai':
        return <AIAssistant messages={messages} onSendMessage={handleSendMessage} />;
      case 'tables':
        return <TableViewer data={queryResults.data} query={queryResults.query} />;
      case 'sql':
        return <SqlEditor onRunQuery={(query) => sendApiCommand('manual-sql-execute', { query })} />;
      default:
        return <div>Select a view from the sidebar</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        profile={profile}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeView === 'ai' ? 'AI Assistant' : 
               activeView === 'tables' ? 'Table Viewer' : 
               activeView === 'sql' ? 'SQL Editor' : 'Admin Dashboard'}
            </h1>
            <button
              onClick={toggleChat}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              title={isChatOpen ? 'Hide Chat' : 'Show Chat'}
            >
              {isChatOpen ? '💬' : '💭'}
            </button>
          </div>
        </header>

        {/* Main View */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Main Content Area */}
            <div className={`${isChatOpen ? 'w-2/3' : 'w-full'} p-6 overflow-auto`}>
              {renderView()}
            </div>

            {/* Chat Panel */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-1/3 border-l border-gray-200 bg-white flex flex-col"
                >
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium">AI Assistant</h2>
                    <button 
                      onClick={toggleChat}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <AIAssistant 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    className="flex-1"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
