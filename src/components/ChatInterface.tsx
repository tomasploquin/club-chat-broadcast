
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Bot, Send, User } from "lucide-react";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate AI response (in a real app, this would call an API)
      setTimeout(() => {
        const response = generateAIResponse(input);
        const assistantMessage = { role: 'assistant' as const, content: response };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate message. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Simple placeholder function to simulate AI response
  const generateAIResponse = (userInput: string): string => {
    if (userInput.toLowerCase().includes('welcome')) {
      return `Welcome to The Members Club!\n\nWe're delighted to have you join our community of distinguished individuals. As a member, you now have access to our exclusive facilities, events, and networking opportunities.\n\nBest regards,\nThe Management`;
    } else if (userInput.toLowerCase().includes('event')) {
      return `Dear Members,\n\nWe're excited to announce our upcoming networking event on June 15th at 7 PM. Join us for an evening of connections and conversations with industry leaders.\n\nPlease RSVP by June 10th.\n\nWarm regards,\nThe Management`;
    } else {
      return `Dear valued members,\n\nThank you for your continued support of our club. Based on your message, I've drafted a response that maintains our professional tone while conveying your message effectively.\n\nPlease review and let me know if you'd like any adjustments.\n\nBest regards,\nThe Management`;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[500px] border rounded-lg overflow-hidden shadow-sm bg-white">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Message Assistant</h3>
      </div>
      
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
    </div>
  );
};

export default ChatInterface;
