import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Check, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type MessagePreviewProps = {
  draftMessage: string;
  draftFile?: File | null;
  onApprove: (message: string, file?: File | null) => void;
};

const MessagePreview = ({ draftMessage, draftFile, onApprove }: MessagePreviewProps) => {
  const [message, setMessage] = useState(draftMessage);
  const { toast } = useToast();

  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  const handleApprove = () => {
    onApprove(message, draftFile);
    toast({
      title: "Message approved",
      description: "Your message is ready to be sent to selected recipients."
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Message Preview</h3>
        </div>
        
        <div className="p-4">
          {draftFile && (
            <div className="mb-4">
              {draftFile.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(draftFile)}
                  alt="Preview"
                  className="max-h-60 rounded-lg object-contain mx-auto"
                />
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <span className="text-sm text-gray-700">{draftFile.name}</span>
                </div>
              )}
            </div>
          )}
          <div className="whitespace-pre-line text-gray-800 mb-4">
            {message}
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <Button
            onClick={handleApprove}
            className="bg-gray-800 hover:bg-gray-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;
