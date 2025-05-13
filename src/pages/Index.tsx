
import React, { useState } from 'react';
import ClubHeader from "@/components/ClubHeader";
import ChatFlow from "@/components/ChatFlow";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ClubHeader />
      
      <main className="flex-1 container py-8 flex justify-center items-center">
        <div className="w-full max-w-3xl px-4">
          <ChatFlow />
        </div>
      </main>
      
      <footer className="py-6 border-t border-gray-100">
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
