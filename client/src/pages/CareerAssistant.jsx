import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/app.api';
import { Sparkles, Send, Loader2, Bot, User, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SUGGESTED_QUESTIONS = [
  'What are my strongest skills?',
  'What should I learn next?',
  'Which jobs match me best?',
  'Why am I not ready for this role?',
  'Create a 4-week study plan.',
];

export default function CareerAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const { data: statusData } = useQuery({
    queryKey: ['aiStatus'],
    queryFn: aiApi.status,
  });

  const mutation = useMutation({
    mutationFn: (question) => aiApi.askAssistant(question),
    onSuccess: (data, question) => {
      setMessages((prev) => [...prev, { role: 'assistant', data: data.data, question }]);
    },
    onError: (err, question) => {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        data: { response: 'Sorry, I encountered an error. Please try again.', suggestions: [], relatedLinks: [], isAIGenerated: false, source: 'Error' },
        question,
      }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (question) => {
    const q = question || input.trim();
    if (!q || mutation.isPending) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    mutation.mutate(q);
  };

  const aiStatus = statusData?.data;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-surface-900">AI Career Assistant</h1>
        <p className="text-surface-500 mt-1">Ask questions about your career, skills, and learning path</p>
      </div>

      {/* AI Status */}
      {aiStatus && !aiStatus.available && (
        <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Using deterministic recommendations because AI service is currently unavailable.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">How can I help you?</h2>
            <p className="text-surface-500 text-sm mb-6">I have access to your profile, skills, and career data</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 rounded-full border border-surface-200 text-sm text-surface-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-md'
                  : 'bg-white border border-surface-200 rounded-bl-md'
              }`}>
                {msg.role === 'user' ? (
                  <p>{msg.text}</p>
                ) : (
                  <>
                    <p className="text-surface-800">{msg.data?.response}</p>
                    {msg.data?.suggestions?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.data.suggestions.map((s, j) => (
                          <button key={j} onClick={() => handleSend(s)} className="text-xs px-3 py-1 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.data?.relatedLinks?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.data.relatedLinks.map((link, j) => (
                          <Link key={j} to={link} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {link}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-surface-400">
                      <Sparkles className="w-3 h-3" />
                      {msg.data?.source || 'Response'}
                    </div>
                  </>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-surface-600" />
              </div>
            )}
          </div>
        ))}

        {mutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-md p-4">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-200 pt-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your career, skills, or learning..."
            className="input-field flex-1"
            disabled={mutation.isPending}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || mutation.isPending}
            className="btn-primary px-4"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
