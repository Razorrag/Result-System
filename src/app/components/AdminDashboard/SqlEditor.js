'use client';

import { useState, useRef, useEffect } from 'react';

export default function SqlEditor({ onRunQuery, isLoading = false }) {
  const [query, setQuery] = useState('SELECT * FROM ');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState([]);
  const textareaRef = useRef(null);

  // Handle tab key in textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Insert tab character
        const newQuery = query.substring(0, start) + '  ' + query.substring(end);
        setQuery(newQuery);
        
        // Move cursor
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const handleRun = async () => {
    if (!query.trim() || isExecuting) return;
    
    setIsExecuting(true);
    try {
      await onRunQuery(query);
      
      // Add to history if not already present
      if (!history.includes(query)) {
        setHistory(prev => [query, ...prev].slice(0, 10)); // Keep last 10 queries
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Run query with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const formatQuery = () => {
    // This is a simple formatter - in a real app, you might want to use a library like sql-formatter
    const formatted = query
      .replace(/\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|CROSS JOIN|UNION|UNION ALL|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE|TRUNCATE TABLE|CREATE INDEX|DROP INDEX|AND|OR|NOT|IN|BETWEEN|LIKE|IS NULL|IS NOT NULL)\b/gi, 
        '\n$1 ')
      .replace(/\b(ASC|DESC|DISTINCT|AS|ON|SET|VALUES|INTO|DEFAULT|PRIMARY KEY|FOREIGN KEY|REFERENCES|CONSTRAINT|CHECK|UNIQUE|INDEX|AUTO_INCREMENT|DEFAULT|NOT NULL|CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME)\b/gi, 
        '\n  $1 ')
      .replace(/;/g, ';\n');
    
    setQuery(formatted.trim());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">SQL Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={formatQuery}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            title="Format SQL"
          >
            Format
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting || !query.trim()}
            className={`px-4 py-1.5 text-sm font-medium rounded-md text-white ${
              isExecuting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExecuting ? 'Running...' : 'Run (Ctrl+Enter)'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-3 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your SQL query here..."
              spellCheck="false"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {query.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <p>• Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Ctrl+Enter</kbd> to run query</p>
            <p>• Use <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Tab</kbd> for indentation</p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="w-full md:w-64 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Query History</h3>
            <div className="border rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {history.map((item, index) => (
                  <li key={index} className="p-2 hover:bg-gray-50 cursor-pointer">
                    <div 
                      className="text-xs font-mono truncate" 
                      onClick={() => setQuery(item)}
                      title={item}
                    >
                      {item.split('\n')[0].substring(0, 50)}{item.split('\n')[0].length > 50 ? '...' : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
