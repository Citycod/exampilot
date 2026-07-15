import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
          isUser 
            ? 'bg-brand-600 text-black rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 text-xs opacity-70 border-t pt-2 border-opacity-20 border-current">
            Tools used: {message.toolCalls.map(t => t.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
