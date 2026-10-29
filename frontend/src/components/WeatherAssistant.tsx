'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import {
  WeatherForecastResponse,
  AirQualityResponse,
  AssistantMessage,
} from '@/types/weather';
import { weatherApi } from '@/services/api';

interface WeatherAssistantProps {
  cityName: string;
  weatherData?: WeatherForecastResponse;
  airQualityData?: AirQualityResponse | null;
}

export const WeatherAssistant: React.FC<WeatherAssistantProps> = ({
  cityName,
  weatherData,
  airQualityData,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm Atmos Assistant. Ask me anything about the weather in ${cityName}, such as rain chances, outdoor recommendations, what the weather will be after 2 days, or the 7-day outlook!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Will it rain today?',
    'What will be the weather after 2 days?',
    'How is the 7-day outlook?',
    'Is tomorrow suitable for outdoor activities?',
    'Should I carry an umbrella?',
    'How is the air quality right now?',
  ]);

  const handleSend = async (questionText: string) => {
    const query = questionText.trim();
    if (!query || isLoading) return;

    // Add user message
    const updatedMessages: AssistantMessage[] = [
      ...messages,
      { role: 'user', content: query },
    ];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await weatherApi.askAssistant({
        question: query,
        city: cityName,
        weather_data: weatherData,
        air_quality_data: airQualityData || undefined,
        conversation_history: updatedMessages,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer },
      ]);

      if (response.suggested_followups && response.suggested_followups.length > 0) {
        setSuggestedQuestions(response.suggested_followups);
      }
    } catch (err) {
      console.error('Assistant chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue retrieving the latest insights. Please try asking again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl border border-white/10 dark:border-white/5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-sky-500/20 border border-white/20 dark:border-white/10 flex-shrink-0 bg-sky-500/10">
            <img src="/bot.png" alt="Smart Weather Assistant" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Smart Weather Assistant
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Grounded in verified hyperlocal data</p>
          </div>
        </div>
        <span className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold">
          Context: {cityName}
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/90 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-200 dark:border-white/10 transition-colors shadow-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full overflow-hidden border border-sky-400/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm bg-sky-500/10">
                <img src="/bot.png" alt="Atmos Bot" className="w-full h-full object-cover" />
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-sky-500 text-white font-medium shadow-md shadow-sky-500/20'
                  : 'glass-card text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5 border border-slate-300/40 dark:border-transparent">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 text-xs items-center text-slate-500 dark:text-slate-400 pl-1">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-400" />
            <span>Analyzing local forecast conditions...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/80 dark:border-white/5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about weather in ${cityName}...`}
          disabled={isLoading}
          className="flex-1 bg-white/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-full px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-40 disabled:hover:bg-sky-500 transition-colors shadow-lg shadow-sky-500/20"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
