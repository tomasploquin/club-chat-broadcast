import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, MessageSquare, Edit } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import MessagePreview from "@/components/MessagePreview";
import MemberSelection from "@/components/MemberSelection";
import ManualDraftInput from "@/components/ManualDraftInput";

const ChatFlow = () => {
  const [step, setStep] = useState<number>(1);
  const [previousStep, setPreviousStep] = useState<number>(1);
  const [draftMode, setDraftMode] = useState<'assistant' | 'manual' | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [finalMessage, setFinalMessage] = useState('');
  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);

  const handleMessageUpdate = (message: string, file?: File | null) => {
    setDraftMessage(message);
    setDraftFile(file || null);
  };

  const handleApprove = (message: string, file?: File | null) => {
    setFinalMessage(message);
    setFinalFile(file || null);
    setIsApproved(true);
    setPreviousStep(step);
    setStep(3); // Move to member selection after approval
  };

  const handleSendComplete = () => {
    setSendComplete(true);
    setTimeout(() => {
      // Reset form and return to first step after successful send
      setDraftMessage('');
      setDraftFile(null);
      setFinalMessage('');
      setFinalFile(null);
      setIsApproved(false);
      setSendComplete(false);
      setDraftMode(null);
      setPreviousStep(step);
      setStep(1);
    }, 2000);
  };

  const nextStep = () => {
    if (step < 3) {
      setPreviousStep(step);
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setPreviousStep(step);
      setStep(step - 1);
    }
  };

  const selectDraftMode = (mode: 'assistant' | 'manual') => {
    setDraftMode(mode);
  };

  // Define flow animation classes based on step transition
  const getFlowAnimationClass = () => {
    if (step > previousStep) {
      return 'animate-flow-right';
    } else if (step < previousStep) {
      return 'animate-flow-left';
    }
    return 'fade-in';
  };

  const renderStep = () => {
    const flowClass = getFlowAnimationClass();
    
    switch (step) {
      case 1:
        return (
          <div className={`${flowClass} flex flex-col items-center w-full max-w-2xl mx-auto`}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Draft Your Message</h2>
              <p className="text-gray-500 text-sm">Choose how you want to create your message</p>
            </div>
            
            {!draftMode ? (
              <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => selectDraftMode('assistant')} 
                  className="flex-1 relative py-12 bg-gray-800 hover:bg-gray-700"
                >
                  <div className="flex flex-col items-center">
                    <MessageSquare className="mb-3 h-8 w-8" />
                    <span className="text-base mb-2">Use AI Assistant</span>
                    <span className="text-xs text-gray-200">Let AI help draft your message</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => selectDraftMode('manual')} 
                  className="flex-1 relative py-12 bg-gray-700 hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center">
                    <Edit className="mb-3 h-8 w-8" />
                    <span className="text-base mb-2">Write Manually</span>
                    <span className="text-xs text-gray-200">Create your own message</span>
                  </div>
                </Button>
              </div>
            ) : (
              <>
                {draftMode === 'assistant' ? (
                  <ChatInterface onMessageUpdate={handleMessageUpdate} />
                ) : (
                  <ManualDraftInput onMessageUpdate={handleMessageUpdate} />
                )}
                
                <div className="flex justify-between mt-6 w-full">
                  <Button 
                    onClick={() => setDraftMode(null)} 
                    variant="outline" 
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  
                  <Button 
                    onClick={nextStep} 
                    className="bg-gray-800 hover:bg-gray-700 gap-2"
                    disabled={!draftMessage}
                  >
                    Preview
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      case 2:
        return (
          <div className={`${flowClass} flex flex-col items-center w-full max-w-2xl mx-auto`}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Preview & Approve</h2>
              <p className="text-gray-500 text-sm">Review your message before sending</p>
            </div>
            <MessagePreview 
              draftMessage={draftMessage} 
              draftFile={draftFile}
              onApprove={handleApprove} 
            />
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
          <div className={`${flowClass} flex flex-col items-center w-full max-w-2xl mx-auto`}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-serif mb-2 text-gray-800">Select Recipients</h2>
              <p className="text-gray-500 text-sm">Choose who will receive your message</p>
            </div>
            <MemberSelection 
              message={finalMessage}
              file={finalFile}
              onSendComplete={handleSendComplete}
            />
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
      default:
        return null;
    }
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif text-gray-800 font-bold border-b-2 border-gray-800 inline-block">Message Broadcast</h1>
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

      <div className="border-2 border-gray-200 rounded-lg shadow-md bg-white p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default ChatFlow;
