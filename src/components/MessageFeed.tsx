
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";

// Mock data for messages
const messages = [
  {
    id: 1,
    title: "Annual Gala Event",
    content: "We're pleased to announce our Annual Gala Event will be held on December 15th. Please RSVP by November 30th.",
    category: "Events",
    timestamp: "2 hours ago",
    isRead: false,
    isPriority: true
  },
  {
    id: 2,
    title: "New Fitness Center Hours",
    content: "Starting next week, the fitness center will be open from 6am to 11pm daily, with extended weekend hours.",
    category: "Facilities",
    timestamp: "Yesterday",
    isRead: true,
    isPriority: false
  },
  {
    id: 3,
    title: "Guest Policy Update",
    content: "Please review our updated guest policy. Members are now permitted to bring up to three guests per visit.",
    category: "Policy",
    timestamp: "3 days ago",
    isRead: true,
    isPriority: false
  },
  {
    id: 4,
    title: "Wine Tasting Event",
    content: "Join us this Friday for an exclusive wine tasting event featuring selections from renowned French vineyards.",
    category: "Events",
    timestamp: "4 days ago",
    isRead: true,
    isPriority: false
  }
];

const MessageCard = ({ message }: { message: typeof messages[0] }) => {
  return (
    <Card className={`mb-4 border-l-4 ${message.isPriority ? 'border-l-club-gold' : 'border-l-transparent'} transition-all hover:shadow-md ${!message.isRead ? 'bg-white' : 'bg-club-cream'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-serif">{message.title}</CardTitle>
          {!message.isRead && (
            <div className="h-2.5 w-2.5 rounded-full bg-club-gold animate-pulse-subtle" title="Unread"></div>
          )}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="bg-club-navy/10">
            {message.category}
          </Badge>
          <span className="text-xs text-club-charcoal/60">{message.timestamp}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{message.content}</p>
      </CardContent>
    </Card>
  );
};

const MessageFeed = () => {
  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-serif">Announcements</h2>
        {unreadCount > 0 && (
          <Badge className="bg-club-gold text-white hover:bg-club-gold/90">
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} new
          </Badge>
        )}
      </div>
      
      <Separator className="mb-6" />
      
      <div>
        {messages.map(message => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default MessageFeed;
