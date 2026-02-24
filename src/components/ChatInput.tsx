import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X, Globe, FileText } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, attachment?: { data: string, mimeType: string, name: string }) => void;
  disabled?: boolean;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
}

export function ChatInput({ onSend, disabled, useWebSearch, onToggleWebSearch }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ data: string, mimeType: string, name: string, url?: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      // Set to Indian English by default, but could be made dynamic
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedFile({
        data: base64String,
        mimeType: file.type,
        name: file.name,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    if (selectedFile) {
      if (selectedFile.url) {
        URL.revokeObjectURL(selectedFile.url);
      }
      setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedFile) && !disabled) {
      if (isListening) toggleListening();
      onSend(input.trim(), selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType, name: selectedFile.name } : undefined);
      setInput('');
      removeFile();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-8 pb-4 md:pb-6 pt-2">
      {selectedFile && (
        <div className="mb-2 relative inline-block">
          {selectedFile.url ? (
            <img src={selectedFile.url} alt="Selected" className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-xl border border-zinc-200 shadow-sm" />
          ) : (
            <div className="flex items-center gap-2 p-2 md:p-3 bg-white border border-zinc-200 rounded-xl shadow-sm pr-8">
              <FileText className="text-blue-500" size={18} />
              <span className="text-xs md:text-sm font-medium text-zinc-700 truncate max-w-[120px] md:max-w-[150px]">{selectedFile.name}</span>
            </div>
          )}
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-zinc-800 text-white p-1 rounded-full hover:bg-zinc-700 transition-colors shadow-md z-10"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className={`relative flex items-end gap-1 md:gap-2 bg-white border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all p-1 ${isListening ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-zinc-200'}`}>
        <div className="flex items-center">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 md:p-3 text-zinc-400 hover:text-orange-500 transition-colors rounded-xl"
            title="Upload image or PDF"
          >
            <Paperclip size={18} className="md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleWebSearch}
            className={`p-2 md:p-3 transition-colors rounded-xl ${useWebSearch ? 'text-blue-500 bg-blue-50' : 'text-zinc-400 hover:text-blue-500'}`}
            title={useWebSearch ? "Web Search Enabled" : "Enable Web Search"}
          >
            <Globe size={18} className="md:w-5 md:h-5" />
          </button>
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 md:p-3 transition-colors rounded-xl ${isListening ? 'text-orange-500 bg-orange-50' : 'text-zinc-400 hover:text-orange-500'}`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={18} className="md:w-5 md:h-5 animate-pulse" /> : <Mic size={18} className="md:w-5 md:h-5" />}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Message ChatPro AI..."}
          className="flex-1 max-h-[150px] md:max-h-[200px] min-h-[40px] md:min-h-[44px] py-2.5 md:py-3 px-1 md:px-2 bg-transparent border-none focus:ring-0 resize-none outline-none text-sm md:text-[15px] placeholder:text-zinc-400"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !selectedFile) || disabled}
          className="p-2 md:p-3 m-1 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors"
        >
          <Send size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </form>
      <div className="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-zinc-400 font-medium px-2">
        ChatPro AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
