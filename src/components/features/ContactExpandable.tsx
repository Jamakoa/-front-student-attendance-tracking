import React from 'react';
import { Plus } from 'lucide-react';

export function ContactExpandable({ contacts }: { contacts: string[] }) {
  const [expanded, setExpanded] = React.useState(false);
  
  if (contacts.length === 0) return <span className="text-gray-400">-</span>;
  if (contacts.length === 1) {
    return (
      <div className="flex items-center gap-2 justify-center">
        {/* <Phone className="w-4 h-4 text-gray-400" /> */}
        <span className="text-sm text-gray-700">{contacts[0]}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 justify-center">
        {/* <Phone className="w-4 h-4 text-blue-600" /> */}
        <span className="text-sm text-gray-700">{contacts[0]}</span>
      </div>
      
      {expanded ? (
        <>
          {contacts.slice(1).map((contact, idx) => (
            <div key={idx} className="flex items-center gap-2 justify-center animate-in fade-in duration-200">
              {/* <Phone className="w-4 h-4 text-gray-400" /> */}
              <span className="text-sm text-gray-600">{contact}</span>
            </div>
          ))}
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium mx-auto block"
          >
            Réduire
          </button>
        </>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 mx-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          {contacts.length - 1} autre{contacts.length > 2 ? 's' : ''}
        </button>
      )}
    </div>
  );
}