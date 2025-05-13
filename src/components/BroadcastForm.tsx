
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";

const BroadcastForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isPriority, setIsPriority] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message || !category) {
      toast({
        title: "Invalid submission",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate sending message to database
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Announcement sent",
        description: "Your message has been broadcast to all members"
      });
      
      // Reset form
      setTitle("");
      setMessage("");
      setCategory("");
      setIsPriority(false);
    }, 1500);
  };

  return (
    <Card className="border-club-navy/20 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-club-navy bg-opacity-5 border-b border-gray-100">
        <CardTitle className="text-xl font-serif">Broadcast Message</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Announcement Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title" 
              className="bg-white"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
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
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message" 
              className="min-h-[120px] bg-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="priority" 
              checked={isPriority}
              onCheckedChange={setIsPriority}
            />
            <Label htmlFor="priority" className="cursor-pointer">Mark as priority announcement</Label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-club-navy hover:bg-club-navy/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Broadcasting...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="mr-2 h-5 w-5" />
                Broadcast Announcement
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BroadcastForm;
