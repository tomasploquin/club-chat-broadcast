
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Check, Edit } from "lucide-react";

type MessagePreviewProps = {
  draftMessage: string;
  onApprove: (message: string, subject: string, category: string) => void;
};

const MessagePreview = ({ draftMessage, onApprove }: MessagePreviewProps) => {
  const [message, setMessage] = useState(draftMessage);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  const handleApprove = () => {
    if (!subject) {
      toast({
        title: "Missing subject",
        description: "Please provide a subject for your message",
        variant: "destructive"
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Missing category",
        description: "Please select a category for your message",
        variant: "destructive"
      });
      return;
    }
    
    onApprove(message, subject, category);
    toast({
      title: "Message approved",
      description: "Your message has been approved for sending"
    });
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-serif text-club-navy">Message Preview</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="gap-1"
          >
            {isEditing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </>
            )}
          </Button>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1 text-gray-700">Subject</label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter message subject"
            className="bg-white"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1 text-gray-700">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Events">Events</SelectItem>
              <SelectItem value="Facilities">Facilities</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="message-content" className="block text-sm font-medium mb-1 text-gray-700">Message</label>
          <Textarea 
            id="message-content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`min-h-[200px] bg-white ${isEditing ? '' : 'bg-gray-50'}`}
            readOnly={!isEditing}
          />
        </div>
        
        <Button 
          onClick={handleApprove}
          className="w-full bg-club-navy hover:bg-club-navy/90"
        >
          <Check className="mr-2 h-5 w-5" />
          Approve Message
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessagePreview;
