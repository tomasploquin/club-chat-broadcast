
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Bot, Send, User, Key } from "lucide-react";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatInterfaceProps = {
  onMessageUpdate: (message: string) => void;
};

const ChatInterface = ({ onMessageUpdate }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your message drafting assistant. Tell me what message you\'d like to send to your club members, and I\'ll help you craft it.' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Find the last assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'assistant');
      
    if (lastAssistantMessage) {
      onMessageUpdate(lastAssistantMessage.content);
    }
  }, [messages, onMessageUpdate]);

  // Check if API key exists in localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  const resetApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setShowApiKeyInput(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please set your OpenAI API key first",
        variant: "destructive"
      });
      setShowApiKeyInput(true);
      return;
    }
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    setIsLoading(true);
    
    try {
      // Call OpenAI API
      const response = await callOpenAI(apiKey, input, messages);
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("OpenAI API error:", error);
      toast({
        title: "Error",
        description: "Failed to generate message. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to call OpenAI API
  const callOpenAI = async (key: string, userInput: string, prevMessages: Message[]): Promise<string> => {
    try {
      // Prepare the messages for the API
      const messagesToSend = [
        {
          role: "system",
          content: "You are a helpful assistant that drafts professional messages for club members. Keep responses concise and well-structured. Format messages as if they're being sent directly to club members."
        },
        ...prevMessages.slice(-4).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: userInput
        }
      ];
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messagesToSend,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      throw error;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[500px] border rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Message Assistant</h3>
      </div>
      
      {showApiKeyInput ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
          <div className="w-full max-w-sm">
            <h3 className="text-lg font-medium text-center mb-4">Enter your OpenAI API key</h3>
            <div className="flex gap-2 mb-2">
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1"
              />
              <Button onClick={saveApiKey} size="sm" className="bg-gray-800 hover:bg-gray-700">
                <Key className="h-3 w-3 mr-1" />
                <span className="text-xs">Save</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-gray-800 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{msg.content}</p>
                  </div>
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      msg.role === 'user' ? 'bg-gray-700' : 'bg-gray-400'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t bg-white flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            {apiKey && (
              <Button 
                type="button" 
                onClick={resetApiKey}
                size="sm"
                variant="outline"
                className="px-2"
                title="Reset API Key"
              >
                <Key className="h-3 w-3" />
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-gray-800 hover:bg-gray-700"
              size="sm"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-3 w-3 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                  <span className="text-xs">Thinking</span>
                </div>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  <span className="text-xs">Send</span>
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
