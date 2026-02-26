import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, type ChatSession } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PanelLeftOpen, Sparkles, Globe2, Zap, Code2, GraduationCap, Scale, Calculator, Download, Trash2, Image as ImageIcon } from 'lucide-react';

type Role = 'user' | 'model';

interface Message {
  id: string;
  role: Role;
  text: string;
}

type Persona = 'general' | 'coder' | 'student' | 'legal' | 'tax' | 'image_creator';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<Persona>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    try {
      const res = await   fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          persona
        })
      });

      const data = await res.json();

      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId
            ? { ...msg, text: data.text || 'No response' }
            : msg
        )
      );

    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId
            ? { ...msg, text: 'API Error. Please try again.' }
            : msg
        )
      );
    }

    setIsLoading(false);
  };

  const personas = [
    { id: 'general', name: 'General', icon: Sparkles },
    { id: 'coder', name: 'Code Master', icon: Code2 },
    { id: 'student', name: 'Student Guide', icon: GraduationCap },
    { id: 'legal', name: 'Legal Guru', icon: Scale },
    { id: 'tax', name: 'Tax Expert', icon: Calculator },
    { id: 'image_creator', name: 'Image Creator', icon: ImageIcon },
  ] as const;

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={() => setMessages([])}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={() => {}}
        onDeleteChat={() => {}}
      />

      <main className="flex-1 flex flex-col h-full relative">

        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-500 md:hidden"
            >
              <PanelLeftOpen size={24} />
            </button>
            <h1 className="text-xl font-bold">ChatPro AI</h1>
          </div>

          <div className="flex gap-2">
            {personas.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    persona === p.id ? 'bg-zinc-200' : 'bg-zinc-100'
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-20 pb-28 px-4">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              text={msg.text}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white p-4">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>

      </main>
    </div>
  );
}
