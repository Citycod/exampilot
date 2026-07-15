import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { BookOpen, LogOut } from 'lucide-react';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [sessionId, setSessionId] = useState(null);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-brand-600" />
          <h1 className="text-xl font-bold text-gray-900">ExamPilot</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 hidden sm:inline-block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            title="Sign out"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <ChatWindow sessionId={sessionId} setSessionId={setSessionId} />
      </main>
    </div>
  );
}
