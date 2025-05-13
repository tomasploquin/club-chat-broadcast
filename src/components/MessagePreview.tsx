
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type MessagePreviewProps = {
  draftMessage: string;
  onApprove: (message: string, subject: string, category: string) => void;
};

const MessagePreview = ({ draftMessage, onApprove }: MessagePreviewProps) => {
  const [message, setMessage] = useState(draftMessage);
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
          <Button 
            onClick={handleApprove}
            className="w-full bg-gray-800 hover:bg-gray-700"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
