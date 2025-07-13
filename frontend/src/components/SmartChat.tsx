import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const SmartChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.sendChatMessage(inputMessage);

      if (response.success && response.data) {
        let assistantText: string;

        // response.data.answer can be string or object
        if (typeof response.data.answer === 'string') {
          assistantText = response.data.answer;
        } else if (
          typeof response.data.answer === 'object' &&
          response.data.answer !== null
        ) {
          // If object has 'result' key, use it
          if ('result' in response.data.answer) {
            assistantText = response.data.answer.result;
          } else {
            // Otherwise stringify for display
            assistantText = JSON.stringify(response.data.answer, null, 2);
          }
        } else {
          assistantText = 'Sorry, received unexpected response format.';
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: assistantText,
          sender: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Smart Assistant</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Ask me anything! I can help with web search, summaries, calculations, and more.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Start a conversation with your AI assistant!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'assistant' && (
                  <Bot className="w-4 h-4 mt-1 text-blue-600" />
                )}
                {message.sender === 'user' && (
                  <User className="w-4 h-4 mt-1 text-white" />
                )}
                <div className="flex-1">
                  <pre className="text-sm whitespace-pre-wrap">{message.text}</pre>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <LoadingSpinner size="small" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
