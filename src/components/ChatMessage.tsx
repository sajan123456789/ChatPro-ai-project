import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Check, Copy, FileText } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessageProps {
  role: 'user' | 'model';
  text: string;
  attachment?: {
    data: string;
    mimeType: string;
    name: string;
  };
  generatedImage?: string;
}

export function ChatMessage({ role, text, attachment, generatedImage }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex w-full py-6 px-4 md:px-8", isUser ? "bg-white" : "bg-zinc-50")}>
      <div className="max-w-3xl mx-auto flex gap-4 w-full">
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
              <User size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <Bot size={18} />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="font-semibold text-sm text-zinc-800">
            {isUser ? 'You' : 'ChatPro AI'}
          </div>
          {attachment && (
            <div className="mb-4">
              {attachment.mimeType.startsWith('image/') ? (
                <img 
                  src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                  alt="Uploaded content" 
                  className="max-w-xs md:max-w-sm rounded-xl border border-zinc-200 shadow-sm"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-zinc-100 rounded-xl border border-zinc-200 max-w-xs">
                  <FileText className="text-blue-500 flex-shrink-0" size={24} />
                  <span className="text-sm font-medium text-zinc-700 truncate">{attachment.name}</span>
                </div>
              )}
            </div>
          )}
          {generatedImage && (
            <div className="mb-4">
              <img 
                src={`data:image/png;base64,${generatedImage}`} 
                alt="Generated content" 
                className="max-w-sm md:max-w-md rounded-xl border border-zinc-200 shadow-sm"
              />
            </div>
          )}
          {text && (
            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed text-[15px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const [isCopied, setIsCopied] = useState(false);

                    const handleCopy = () => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    };

                    if (!inline && match) {
                      return (
                        <div className="relative group rounded-xl overflow-hidden my-4 border border-zinc-800">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-sans border-b border-zinc-800">
                            <span>{match[1]}</span>
                            <button
                              onClick={handleCopy}
                              className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              {isCopied ? 'Copied!' : 'Copy code'}
                            </button>
                          </div>
                          <SyntaxHighlighter
                            {...props}
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, padding: '1rem' }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
