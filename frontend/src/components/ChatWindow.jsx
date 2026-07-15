import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ToolCallIndicator from './ToolCallIndicator';
import { chatService } from '../services/api';

export default function ChatWindow({ sessionId, setSessionId }) {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hello! I am ExamPilot. What exam are you preparing for?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeTool]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Simulate tool thinking states (in a real streaming app this comes from backend events)
      // Since we don't have streaming, we show generic or guessed states based on input if we wanted to be clever,
      // but the requirement asks for specific tool call feedback.
      // Since the backend doesn't stream intermediate steps, we'll show a generic loading initially,
      // but if the user specifically asked for an exam, we could optimistically show it.
      // A better way is to do two-step if we had websockets. With REST, we'll just show "Thinking..."
      // and display the tool calls after the fact in the MessageBubble, OR we can simulate it with a timeout.
      // For this assessment, since it's REST, we'll just show a generic "Thinking..." while waiting for the full response.
      setActiveTool('thinking');

      const response = await chatService.sendMessage(userText, sessionId);

      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response.message,
        toolCalls: response.toolCalls
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      setActiveTool(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm">
              {activeTool === 'thinking' ? (
                <div className="flex space-x-2 animate-pulse">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animation-delay-400"></div>
                </div>
              ) : (
                <ToolCallIndicator toolName={activeTool} />
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
