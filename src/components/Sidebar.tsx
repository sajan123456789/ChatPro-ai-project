import React from 'react';
import { MessageSquarePlus, Settings, HelpCircle, LogOut, PanelLeftClose, MessageSquare, Trash2 } from 'lucide-react';

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export function Sidebar({ isOpen, onToggle, onNewChat, chats, currentChatId, onSelectChat, onDeleteChat }: SidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-300 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}
    >
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors text-sm font-medium border border-zinc-800"
        >
          <div className="bg-orange-500/10 text-orange-500 p-1 rounded-md">
            <MessageSquarePlus size={18} />
          </div>
          New Chat
        </button>
        <button
          onClick={onToggle}
          className="md:hidden ml-2 p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-zinc-500 mb-3 px-2 uppercase tracking-wider">
          Recent Chats
        </div>
        <div className="space-y-1">
          {chats.length === 0 ? (
            <div className="text-xs text-zinc-600 px-2 italic">No recent chats</div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id}
                className={`group flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentChatId === chat.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="flex-1 truncate flex items-center gap-2"
                >
                  <MessageSquare size={14} className="flex-shrink-0 opacity-50" />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-900 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors">
          <Settings size={18} />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors">
          <HelpCircle size={18} />
          Help & FAQ
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors">
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
