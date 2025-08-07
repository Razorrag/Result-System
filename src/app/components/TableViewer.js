"use client";

import { motion } from 'framer-motion';

export default function TableViewer({ data, query }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>No results found for your query.</p>
        {query && <p className="font-mono text-xs mt-2 bg-gray-800 p-2 rounded-md inline-block">{query}</p>}
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 h-full flex flex-col"
    >
      {query && (
          <p className="font-mono text-xs mb-4 text-gray-300 bg-gray-900 p-2 rounded-md">
              {query}
          </p>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-100 uppercase bg-gray-700 sticky top-0">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                {headers.map(header => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4">
                    {typeof row[header] === 'object' && row[header] !== null 
                        ? JSON.stringify(row[header]) 
                        : String(row[header])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}