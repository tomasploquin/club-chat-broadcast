
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

const ClubHeader = () => {
  return (
    <header className="bg-club-navy text-white py-4 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-serif font-semibold">
          <span className="text-club-gold">The</span> Members Club
        </h1>
      </div>
      <Button variant="ghost" className="text-white hover:bg-club-navy/50">
        <User className="mr-2 h-5 w-5" />
        <span className="hidden md:inline">Account</span>
      </Button>
    </header>
  );
};

export default ClubHeader;
