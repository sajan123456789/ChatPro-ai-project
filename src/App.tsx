import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, type ChatSession } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PanelLeftOpen, Sparkles, Globe2, ShieldCheck, Zap, Code2, GraduationCap, Scale, Calculator, Download, Trash2, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<Persona>('general');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats on mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('chatpro_chats');
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
    } catch (e) {
      console.warn('localStorage not available');
    }
  }, []);

  // Save messages whenever they change (if there's a current chat)
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      try {
        localStorage.setItem(`chatpro_messages_${currentChatId}`, JSON.stringify(messages));
        
        // Update chat title if it's new
        setChats(prev => {
          const chat = prev.find(c => c.id === currentChatId);
          if (chat && chat.title === 'New Chat') {
            const updated = prev.map(c => {
              if (c.id === currentChatId) {
                return { 
                  ...c, 
                  updatedAt: Date.now(), 
                  title: (messages[0].text.slice(0, 30) + (messages[0].text.length > 30 ? '...' : '')) || 'Image Generation'
                };
              }
              return c;
            });
            localStorage.setItem('chatpro_chats', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      } catch (e) {
        console.warn('localStorage not available');
      }
    }
  }, [messages, currentChatId]);

  const handleSend = async (text: string, attachment?: { data: string, mimeType: string, name: string }) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = Date.now().toString();
      setCurrentChatId(chatId);
      const newChat = { id: chatId, title: 'New Chat', updatedAt: Date.now() };
      setChats(prev => {
        const updated = [newChat, ...prev];
        try {
          localStorage.setItem('chatpro_chats', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text, attachment };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    try {
      const stream = streamChatResponse(newMessages, persona, useWebSearch);
      for await (const chunk of stream) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId
            ? { ...msg, text: 'Sorry, I encountered an error while processing your request. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    try {
      const savedMessages = localStorage.getItem(`chatpro_messages_${id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    const updatedChats = chats.filter(c => c.id !== id);
    setChats(updatedChats);
    try {
      localStorage.setItem('chatpro_chats', JSON.stringify(updatedChats));
      localStorage.removeItem(`chatpro_messages_${id}`);
    } catch (e) {}
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const handleClearCurrentChat = () => {
    if (currentChatId) {
      handleDeleteChat(currentChatId);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    
    let chatText = `ChatPro AI - ${personas.find(p => p.id === persona)?.name} Chat\nDate: ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach(msg => {
      const roleName = msg.role === 'user' ? 'You' : 'ChatPro AI';
      chatText += `[${roleName}]\n${msg.text}\n\n`;
    });

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChatPro_AI_Export_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const personas = [
    { id: 'general', name: 'General', icon: Sparkles },
    { id: 'image_creator', name: 'Image Creator', icon: ImageIcon },
    { id: 'coder', name: 'Code Master', icon: Code2 },
    { id: 'student', name: 'Student Guide', icon: GraduationCap },
    { id: 'legal', name: 'Legal Guru', icon: Scale },
    { id: 'tax', name: 'Tax Expert', icon: Calculator },
  ] as const;

  return (
    <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full relative">
        <header className="absolute top-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between z-10 bg-gradient-to-b from-white via-white to-transparent">
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 text-zinc-500 hover:text-zinc-900 transition-colors md:hidden"
            >
              <PanelLeftOpen size={24} />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-emerald-600 to-blue-600 tracking-tight hidden md:block">
              ChatPro AI
            </h1>
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-1.5 md:gap-2 px-1 md:px-4 min-w-0">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-1 flex overflow-x-auto hide-scrollbar max-w-full shrink">
              {personas.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                      persona === p.id 
                        ? 'bg-zinc-100 text-zinc-900' 
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon size={16} className={persona === p.id ? 'text-orange-500' : ''} />
                    <span className="hidden sm:inline">{p.name}</span>
                  </button>
                );
              })}
            </div>
            
            {messages.length > 0 && (
              <div className="flex gap-1.5 md:gap-2 shrink-0">
                <button
                  onClick={handleExportChat}
                  className="p-2 bg-white border border-zinc-200 rounded-xl shadow-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                  title="Export Chat"
                >
                  <Download size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={handleClearCurrentChat}
                  className="p-2 bg-white border border-zinc-200 rounded-xl shadow-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-20 md:pt-24 pb-32">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-orange-100 to-emerald-100 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 shadow-sm border border-zinc-100">
                {React.createElement(personas.find(p => p.id === persona)?.icon || Sparkles, { 
                  className: "text-emerald-600 w-8 h-8 md:w-10 md:h-10" 
                })}
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-zinc-800 mb-3 md:mb-4 tracking-tight">
                {personas.find(p => p.id === persona)?.name || 'ChatPro AI'}
              </h2>
              <p className="text-sm md:text-base text-zinc-500 mb-8 md:mb-12 max-w-lg leading-relaxed">
                {persona === 'general' && "India's advanced AI assistant. I can help you write, learn, brainstorm, and more."}
                {persona === 'image_creator' && "Describe an image you want to see, and I will generate it for you."}
                {persona === 'coder' && "Elite software engineer. Ready to write, debug, and optimize your code."}
                {persona === 'student' && "Your personal tutor for CBSE, ICSE, and State Boards. Let's learn together."}
                {persona === 'legal' && "Expert in Indian Law and the Constitution. Ask me legal questions."}
                {persona === 'tax' && "Specialist in Indian taxation, GST, and financial planning."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full text-left">
                <button
                  onClick={() => handleSend(
                    persona === 'image_creator' ? "A futuristic city in India with flying cars and neon lights, cyberpunk style." :
                    persona === 'coder' ? "Write a React component for a responsive navigation bar using Tailwind CSS." :
                    persona === 'legal' ? "What are the fundamental rights guaranteed by the Indian Constitution?" :
                    persona === 'tax' ? "Explain the new tax regime vs old tax regime in India for FY 2024-25." :
                    persona === 'student' ? "Explain Newton's laws of motion with simple real-life examples." :
                    "Explain the history of the Indian Space Research Organisation (ISRO)."
                  )}
                  className="p-3 md:p-4 rounded-2xl border border-zinc-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 text-zinc-800 text-sm md:text-base font-medium">
                    <Globe2 size={18} className="text-orange-500" />
                    {persona === 'image_creator' ? "Sci-Fi Concept" :
                     persona === 'coder' ? "Frontend Dev" :
                     persona === 'legal' ? "Constitutional Law" :
                     persona === 'tax' ? "Income Tax" :
                     persona === 'student' ? "Physics" :
                     "History & Culture"}
                  </div>
                  <div className="text-xs md:text-sm text-zinc-500 group-hover:text-zinc-600 line-clamp-2">
                    {persona === 'image_creator' ? "A futuristic city in India with flying cars and neon lights, cyberpunk style." :
                     persona === 'coder' ? "Write a React component for a responsive navigation bar using Tailwind CSS." :
                     persona === 'legal' ? "What are the fundamental rights guaranteed by the Indian Constitution?" :
                     persona === 'tax' ? "Explain the new tax regime vs old tax regime in India for FY 2024-25." :
                     persona === 'student' ? "Explain Newton's laws of motion with simple real-life examples." :
                     "Explain the history of the Indian Space Research Organisation (ISRO)."}
                  </div>
                </button>
                <button
                  onClick={() => handleSend(
                    persona === 'image_creator' ? "A beautiful majestic Bengal tiger walking in a lush green forest, highly detailed." :
                    persona === 'coder' ? "How do I fix a CORS error in my Express.js backend?" :
                    persona === 'legal' ? "What are the key changes in the Bharatiya Nyaya Sanhita compared to the IPC?" :
                    persona === 'tax' ? "How do I calculate GST for a software service business?" :
                    persona === 'student' ? "Write an essay on the importance of renewable energy in India." :
                    "Write an email to my boss asking for leave for Diwali."
                  )}
                  className="p-3 md:p-4 rounded-2xl border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 text-zinc-800 text-sm md:text-base font-medium">
                    <Zap size={18} className="text-emerald-500" />
                    {persona === 'image_creator' ? "Nature & Wildlife" :
                     persona === 'coder' ? "Backend & Debugging" :
                     persona === 'legal' ? "Criminal Law" :
                     persona === 'tax' ? "GST & Business" :
                     persona === 'student' ? "English & Essay" :
                     "Drafting & Writing"}
                  </div>
                  <div className="text-xs md:text-sm text-zinc-500 group-hover:text-zinc-600 line-clamp-2">
                    {persona === 'image_creator' ? "A beautiful majestic Bengal tiger walking in a lush green forest, highly detailed." :
                     persona === 'coder' ? "How do I fix a CORS error in my Express.js backend?" :
                     persona === 'legal' ? "What are the key changes in the Bharatiya Nyaya Sanhita compared to the IPC?" :
                     persona === 'tax' ? "How do I calculate GST for a software service business?" :
                     persona === 'student' ? "Write an essay on the importance of renewable energy in India." :
                     "Write an email to my boss asking for leave for Diwali."}
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} text={msg.text} attachment={msg.attachment} generatedImage={msg.generatedImage} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10">
          <ChatInput 
            onSend={handleSend} 
            disabled={isLoading} 
            useWebSearch={useWebSearch}
            onToggleWebSearch={() => setUseWebSearch(!useWebSearch)}
          />
        </div>
      </main>
    </div>
  );
}
