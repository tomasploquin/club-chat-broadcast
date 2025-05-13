
import React, { useState } from 'react';
import ClubHeader from "@/components/ClubHeader";
import ChatInterface from "@/components/ChatInterface";
import MessagePreview from "@/components/MessagePreview";
import MemberSelection from "@/components/MemberSelection";

const Index = () => {
  const [draftMessage, setDraftMessage] = useState('');
  const [finalMessage, setFinalMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageCategory, setMessageCategory] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);

  const handleMessageUpdate = (message: string) => {
    setDraftMessage(message);
  };

  const handleApprove = (message: string, subject: string, category: string) => {
    setFinalMessage(message);
    setMessageSubject(subject);
    setMessageCategory(category);
    setIsApproved(true);
  };

  const handleSendComplete = () => {
    setSendComplete(true);
    setTimeout(() => {
      // Reset form after successful send
      setDraftMessage('');
      setFinalMessage('');
      setMessageSubject('');
      setMessageCategory('');
      setIsApproved(false);
      setSendComplete(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-club-cream">
      <ClubHeader />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-serif mb-8 text-club-navy">Message Broadcasting Center</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-serif mb-4 text-club-navy">Draft Your Message</h2>
            <ChatInterface onMessageUpdate={handleMessageUpdate} />
          </div>
          
          <div>
            <h2 className="text-xl font-serif mb-4 text-club-navy">Preview & Send</h2>
            <div className="space-y-8">
              <MessagePreview 
                draftMessage={draftMessage} 
                onApprove={handleApprove} 
              />
              
              <MemberSelection 
                messageSubject={messageSubject}
                messageContent={finalMessage}
                messageCategory={messageCategory}
                onSendComplete={handleSendComplete}
                disabled={!isApproved || sendComplete}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-club-gray/20 bg-white">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-club-charcoal/60">© {new Date().getFullYear()} The Members Club</p>
          <div className="flex items-center gap-6">
            <p className="text-xs text-club-charcoal/40">Terms & Privacy</p>
            <p className="text-xs text-club-charcoal/40">Contact</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
