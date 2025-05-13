
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import MessagePreview from "@/components/MessagePreview";
import MemberSelection from "@/components/MemberSelection";

const ChatFlow = () => {
  const [step, setStep] = useState<number>(1);
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
    setStep(3); // Move to member selection after approval
  };

  const handleSendComplete = () => {
    setSendComplete(true);
    setTimeout(() => {
      // Reset form and return to first step after successful send
      setDraftMessage('');
      setFinalMessage('');
      setMessageSubject('');
      setMessageCategory('');
      setIsApproved(false);
      setSendComplete(false);
      setStep(1);
    }, 2000);
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="fade-in flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Draft Your Message</h2>
              <p className="text-gray-500 text-sm">Use the AI assistant to help craft your message</p>
            </div>
            <ChatInterface onMessageUpdate={handleMessageUpdate} />
            <div className="flex justify-end mt-6 w-full">
              <Button 
                onClick={nextStep} 
                className="bg-gray-800 hover:bg-gray-700 gap-2"
                disabled={!draftMessage}
              >
                Preview
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="fade-in flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Preview & Approve</h2>
              <p className="text-gray-500 text-sm">Review your message before sending</p>
            </div>
            <MessagePreview draftMessage={draftMessage} onApprove={handleApprove} />
            <div className="flex justify-between mt-6 w-full">
              <Button 
                onClick={prevStep} 
                variant="outline" 
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="fade-in flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Select Recipients</h2>
              <p className="text-gray-500 text-sm">Choose members to receive your message</p>
            </div>
            <MemberSelection
              messageSubject={messageSubject}
              messageContent={finalMessage}
              messageCategory={messageCategory}
              onSendComplete={handleSendComplete}
              disabled={!isApproved || sendComplete}
            />
            <div className="flex justify-start mt-6 w-full">
              <Button 
                onClick={prevStep} 
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif text-gray-800">Message Broadcast</h1>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center ${step >= 1 ? 'text-gray-800' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>1</div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Draft</span>
            </div>
            <div className={`w-10 h-0.5 ${step > 1 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-gray-800' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>2</div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Preview</span>
            </div>
            <div className={`w-10 h-0.5 ${step > 2 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-gray-800' : 'text-gray-300'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>3</div>
              <span className="ml-2 text-sm font-medium hidden sm:inline">Send</span>
            </div>
          </div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
};

export default ChatFlow;
