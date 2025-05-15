import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MessagePreviewProps = {
  draftMessage: string;
  onApprove: (message: string, subject: string, category: string) => void;
};

const MessagePreview = ({ draftMessage, onApprove }: MessagePreviewProps) => {
  const [message, setMessage] = useState(draftMessage);
  const [recipientNumber, setRecipientNumber] = useState('+34657126472'); // Default number
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  // We still need these for the API but they won't be shown in UI
  const [subject, setSubject] = useState('Message');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  const handleApprove = () => {
    onApprove(message, subject, category);
    toast({
      title: "Message approved",
      description: "Your message is ready to send"
    });
  };

  const handleSendWhatsApp = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          recipient: recipientNumber
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        toast({
          title: "WhatsApp sent!",
          description: "Your message has been sent via WhatsApp"
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send WhatsApp message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the WhatsApp service",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* WhatsApp style message preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Message Preview</h3>
        </div>
        
        <div className="p-4 bg-[#e5ded8] bg-opacity-30 min-h-[280px]">
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-lg py-2 px-3 max-w-[85%] shadow-sm">
              <p className="text-sm whitespace-pre-line">{message}</p>
              <p className="text-right text-[10px] text-gray-500 mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="mb-3">
            <Label htmlFor="recipient" className="text-xs text-gray-500 mb-1">
              WhatsApp Recipient Number
            </Label>
            <Input
              id="recipient"
              type="text"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              placeholder="+1234567890"
              className="text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter full number with country code (e.g., +34657126472)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleApprove}
              className="flex-1 bg-gray-800 hover:bg-gray-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Message
            </Button>
            
            <Button 
              onClick={handleSendWhatsApp}
              disabled={isSending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send via WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
