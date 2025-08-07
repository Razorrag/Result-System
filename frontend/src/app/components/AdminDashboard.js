"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

import AIAssistant from './AIAssistant';
import TableViewer from './TableViewer';
import SqlEditor from './SqlEditor';

// --- Icon Components ---
const AiIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> </svg> );
const TableIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M4 4h16v16H4z" /> </svg> );
const SqlIcon = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2z" /> </svg> );

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');

export default function AdminDashboard({ user, profile, signOut }) {
  const [activeView, setActiveView] = useState('ai');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([{text: "Hello! I am your secure SQL assistant. How can I help you query the database today?", sender: 'ai'}]);
  const [queryResults, setQueryResults] = useState({ query: '', data: [] });

  useEffect(() => {
    // --- Connection Events ---
    socket.on('connect', () => { setIsConnected(true); toast.success('Connected to Real-Time Server!'); });
    socket.on('disconnect', () => { setIsConnected(false); toast.error('Disconnected from Real-Time Server!'); });

    // --- Command Loop Events ---
    socket.on('server:query_result', ({ query, data }) => {
      setIsLoading(false);
      setMessages(prev => [...prev, { text: "Here are the results for your query.", sender: 'ai' }]);
      setQueryResults({ query, data });
      setActiveView('tables');
      toast.success(`Successfully fetched ${data.length} rows.`);
    });

    socket.on('server:write_confirmation', ({ query }) => {
      setIsLoading(false);
      const confirmationMessage = `AI has generated the following query for your review. Please confirm to execute it.\n\n\`\`\`sql\n${query}\n\`\`\``
      setMessages(prev => [...prev, { text: confirmationMessage, sender: 'ai' }]);
      toast((t) => (
        <span className="flex flex-col items-center gap-2 text-white">
          Execute this write query?
          <pre className="text-xs bg-gray-800 p-2 rounded w-full text-left max-h-40 overflow-auto">{query}</pre>
          <div className="flex gap-2">
            <button onClick={() => { socket.emit('execute-confirmed-write', { query }); toast.dismiss(t.id); }}
                    className="bg-green-600 hover:bg-green-700 font-bold py-1 px-3 rounded">
              Confirm
            </button>
            <button onClick={() => { setMessages(prev => [...prev, { text: "Write operation cancelled.", sender: 'ai' }]); toast.dismiss(t.id);}}
                    className="bg-red-600 hover:bg-red-700 font-bold py-1 px-3 rounded">
              Cancel
            </button>
          </div>
        </span>
      ), { duration: 20000, style: { background: '#4B5563', color: '#fff' } });
    });

    socket.on('server:query_success', ({ message, data }) => {
      setIsLoading(false);
      toast.success(message);
      setMessages(prev => [...prev, { text: `✅ ${message}`, sender: 'ai' }]);
    });

    socket.on('server:ui_action', ({ view }) => {
      setIsLoading(false);
      setActiveView(view.split(':')[0]);
      setMessages(prev => [...prev, { text: `Opening the ${view.replace(/_/, ' ')} view.`, sender: 'ai' }]);
    });
    
    socket.on('server:error', ({ message }) => {
      setIsLoading(false);
      toast.error(message);
      setMessages(prev => [...prev, { text: `⚠️ Error: ${message}`, sender: 'ai' }]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('server:query_result');
      socket.off('server:write_confirmation');
      socket.off('server:query_success');
      socket.off('server:ui_action');
      socket.off('server:error');
    };
  }, []);

  const handleSendMessage = (command) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { text: command, sender: 'user' }]);
    socket.emit('user-command', command);
  };
  
  const handleRunManualQuery = (query) => {
    setIsLoading(true);
    toast('Executing manual query...');
    socket.emit('manual-sql-execute', { query });
  }

  const handleFileUpload = (file, command) => {
    const defaultCommand = "Please add this data to the appropriate table.";
    const userCommand = command.trim() || defaultCommand;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { text: `${userCommand}\nUploading ${file.name}...`, sender: 'user' }]);
    const toastId = toast.loading(`Parsing ${file.name}...`);
    
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let jsonData;

        if (file.name.endsWith('.csv')) {
          const result = Papa.parse(data, { header: true, skipEmptyLines: true });
          if(result.errors.length > 0) {
            throw new Error(`CSV parsing error: ${result.errors[0].message}`);
          }
          jsonData = result.data;
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }
        
        if (!jsonData || jsonData.length === 0) {
            throw new Error("The file is empty or could not be parsed correctly.")
        }

        toast.success(`${file.name} parsed successfully. Sending to AI...`, { id: toastId });
        socket.emit('user-command-with-data', { command: userCommand, data: jsonData });
      } catch (err) {
        toast.error(`Failed to parse file: ${err.message}`, { id: toastId });
        setMessages(prev => [...prev, { text: `⚠️ Error: Failed to parse ${file.name}.`, sender: 'ai' }]);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
        toast.error('Failed to read the file.', { id: toastId });
        setIsLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  const SidebarButton = ({ view, label, icon }) => (
    <button onClick={() => setActiveView(view)} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${ activeView === view ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700' }`}>
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-screen flex bg-gray-900 text-white font-sans">
      <div className="w-64 bg-gray-800 p-4 flex flex-col shrink-0">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-wider">JECRC Panel</h1>
            <p className="text-sm text-gray-400">Admin</p>
        </div>
        <nav className="flex-grow space-y-2">
            <SidebarButton view="ai" label="AI Assistant" icon={<AiIcon className="w-5 h-5" />} />
            <SidebarButton view="tables" label="Table Viewer" icon={<TableIcon className="w-5 h-5" />} />
            <SidebarButton view="sql" label="SQL Editor" icon={<SqlIcon className="w-5 h-5" />} />
        </nav>
        <div className="mt-auto">
            <div className="flex items-center mb-4"><div className="w-10 h-10 bg-jecrc-maroon rounded-full flex items-center justify-center font-bold">{profile?.first_name?.[0] || user.email[0]}</div><div className="ml-3"><p className="font-semibold">{profile.first_name || 'Admin'}</p><p className="text-xs text-gray-400">{user.email}</p></div></div>
            <button onClick={signOut} className="w-full bg-red-700/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">Sign Out</button>
        </div>
      </div>
      <main className="flex-1 flex flex-col p-6 min-w-0">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold capitalize">{activeView.replace(/_/, ' ')} View</h2>
            <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div><span className="text-sm text-gray-400">{isConnected ? 'Connected' : 'Disconnected'}</span></div>
        </div>
        <div className="flex-1 bg-gray-800/50 rounded-lg border border-white/10 flex flex-col overflow-hidden">
            {activeView === 'ai' && <AIAssistant messages={messages} onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} isLoading={isLoading} />}
            {activeView === 'tables' && <TableViewer data={queryResults.data} query={queryResults.query} />}
            {activeView === 'sql' && <SqlEditor onRunQuery={handleRunManualQuery} isLoading={isLoading} />}
        </div>
      </main>
    </motion.div>
  );
}