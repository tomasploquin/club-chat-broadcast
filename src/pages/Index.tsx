
import React from 'react';
import ClubHeader from "@/components/ClubHeader";
import BroadcastForm from "@/components/BroadcastForm";
import MessageFeed from "@/components/MessageFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-club-cream">
      <ClubHeader />
      
      <main className="flex-1 container py-8">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="messages">Announcements</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-4">
            <MessageFeed />
          </TabsContent>
          
          <TabsContent value="broadcast" className="space-y-4">
            <div className="max-w-xl mx-auto">
              <p className="text-club-charcoal/70 mb-6 text-sm">
                Use this form to send important announcements to all club members. 
                Messages marked as priority will be highlighted in members' feeds.
              </p>
              <BroadcastForm />
            </div>
          </TabsContent>
        </Tabs>
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
