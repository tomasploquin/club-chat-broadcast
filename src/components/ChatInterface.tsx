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
  
  // Fixed API key - stored directly in the component
  const apiKey = "sk-zh_9SNsAGZEbrQuBJ8HAx-iqJcimJXCQoBhqnqF6IUT3BlbkFJ2qqp4zX1M2dzFa4AlUtxWqqOmThpxpGyjFO2g3M3kA";

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
      // Call OpenAI API
      const response = await callOpenAI(input, messages);
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("OpenAI API error:", error);
      toast({
        title: "Error",
        description: "Failed to generate message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to call OpenAI API
  const callOpenAI = async (userInput: string, prevMessages: Message[]): Promise<string> => {
    try {
      // Enhanced system prompt with JOMO-specific instructions
      const systemPrompt = {
        role: "system",
        content: `You are a message drafting assistant for JOMO Club communications. Your role is to craft warm, engaging, and well-structured messages that match JOMO's friendly and inclusive tone.

Message Structure Guidelines:
1. Start with a personalized greeting (e.g., "Hello JOMO Members", "Dear JOMO Community")
2. Use an engaging opening line that creates excitement
3. Include clear event details:
   - Date and time
   - Location
   - Any special arrangements or notes
4. End with a clear call-to-action (e.g., "RSVP now via the App or this chat")
5. Sign off with "With Love, The JOMO Family"

Tone and Style:
- Warm
- Make the description short and concise
- Conversational and friendly
- Keep paragraphs short and easy to read
- Include personal touches that make members feel valued

Example Format:
[Greeting]

[Engaging opening line]

[Event details in clear, concise paragraphs]

[Call to action]

With Love,
The JOMO Family

Please maintain this consistent format while adapting the content to the specific event or announcement.`
      };

      // Get the last 6 messages for better context
      const recentMessages = prevMessages.slice(-6);
      
      // Prepare the messages for the API with enhanced context
      const messagesToSend = [
        systemPrompt,
        ...recentMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: `Please help me draft a JOMO message: ${userInput}`
        }
      ];
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messagesToSend,
          temperature: 0.7,
          max_tokens: 800,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
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
