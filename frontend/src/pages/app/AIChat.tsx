import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, User, Bot, RefreshCw, Copy, ThumbsUp, ThumbsDown, Paperclip, Mic } from 'lucide-react';
import api from '@/api/client';
import toast from 'react-hot-toast';

interface Message {
  id       : string;
  role     : 'user' | 'assistant';
  content  : string;
  timestamp: Date;
  liked?   : boolean;
}

const suggestedQuestions = [
  '📊 Analyze my portfolio health',
  '🛡️ How risky is my portfolio?',
  '🎯 Create an SIP plan for ₹10,000/month',
  '📈 Should I buy HDFC Bank now?',
  '💰 How to retire with ₹5 crore?',
  '⚡ Top 5 stocks to watch this week',
];

const formatMessage = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded font-numeric text-brand-300 text-xs">$1</code>')
    .replace(/\n/g, '<br/>');
};

export default function AIChat() {
  const [messages, setMessages]   = useState<Message[]>([
    {
      id      : '0',
      role    : 'assistant',
      content : "**Namaste! I'm your FinSight AI financial coach.** 🤖💼\n\nI can help you with:\n\n• **Portfolio analysis** — health score, risk, diversification\n• **Stock recommendations** — buy/hold/sell with reasoning\n• **Goal planning** — SIP calculations, retirement planning\n• **Market insights** — news impact, sector analysis\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState<string>(Date.now().toString());
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id       : Date.now().toString(),
      role     : 'user',
      content  : text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', {
        message  : text,
        sessionId,
        history,
      });

      const aiMsg: Message = {
        id       : (Date.now() + 1).toString(),
        role     : 'assistant',
        content  : data.data?.reply || data.data?.message || 'I apologize, I could not process that. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id       : (Date.now() + 1).toString(),
        role     : 'assistant',
        content  : 'I\'m having trouble connecting right now. Please try again in a moment. 🔄',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const clearChat = () => {
    setMessages([{
      id      : '0',
      role    : 'assistant',
      content : "Chat cleared! What would you like to explore?",
      timestamp: new Date(),
    }]);
    setSessionId(Date.now().toString());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center shadow-glow">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-display">AI Financial Coach</h1>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online · Powered by GPT-4
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="btn-secondary text-xs gap-1.5 px-3 py-2">
          <RefreshCw className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-brand-500 to-accent-violet'
                  : 'bg-gradient-to-br from-brand-600/30 to-accent-violet/30 border border-brand-500/30'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-brand-400" />}
              </div>

              {/* Bubble */}
              <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
                {/* Actions */}
                <div className={`flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <button onClick={() => copyMessage(msg.content)} className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-slate-400 transition-colors">
                    <Copy className="w-3 h-3" />
                  </button>
                  {msg.role === 'assistant' && (
                    <>
                      <button className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-emerald-400 transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10 text-slate-600 hover:text-rose-400 transition-colors">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <span className="text-2xs text-slate-600 ml-1 self-center">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div className="chat-bubble-ai">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions (show only when fresh) */}
      {messages.length <= 1 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-300 transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="card-static p-3 flex items-end gap-3">
        <button className="btn-icon p-2 text-slate-500">
          <Paperclip className="w-4 h-4" />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your portfolio, market, or investment strategy..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto no-scrollbar"
          style={{ minHeight: '24px' }}
        />
        <button className="btn-icon p-2 text-slate-500 hover:text-brand-400">
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-40 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-2xs text-slate-600 mt-2">
        FinSight AI can make mistakes. This is not financial advice. Always consult a certified advisor.
      </p>
    </div>
  );
}
