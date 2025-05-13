
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ManualDraftInputProps = {
  onMessageUpdate: (message: string) => void;
};

const ManualDraftInput = ({ onMessageUpdate }: ManualDraftInputProps) => {
  const [text, setText] = useState('');
  const { toast } = useToast();
  
  // Update parent component whenever text changes
  useEffect(() => {
    onMessageUpdate(text);
  }, [text, onMessageUpdate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Your Message</h3>
        </div>
        
        <div className="p-4">
          <Textarea 
            value={text}
            onChange={handleTextChange}
            placeholder="Type your message here..."
            className="min-h-[280px] focus:border-gray-300"
          />
          <p className="mt-2 text-xs text-gray-500 text-right">
            {text.length} characters
          </p>
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Type your message exactly as you want it to appear to recipients
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualDraftInput;
