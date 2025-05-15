
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCheck, Search, Send, UsersRound, MessageSquare } from "lucide-react";
import { sendBatchWhatsAppMessages } from "@/utils/whatsappApi";

// Mock data for members - in a real app this would come from a database
const mockMembers = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", group: "Executive", phone: "+15551234567" },
  { id: "2", name: "Bob Johnson", email: "bob@example.com", group: "Executive", phone: "+15552345678" },
  { id: "3", name: "Carol Williams", email: "carol@example.com", group: "VIP", phone: "+15553456789" },
  { id: "4", name: "David Brown", email: "david@example.com", group: "VIP", phone: "+15554567890" },
  { id: "5", name: "Eve Davis", email: "eve@example.com", group: "Standard", phone: "+15555678901" },
  { id: "6", name: "Frank Miller", email: "frank@example.com", group: "Standard", phone: "+15556789012" },
  { id: "7", name: "Grace Wilson", email: "grace@example.com", group: "Standard", phone: "+15557890123" },
  { id: "8", name: "Hannah Moore", email: "hannah@example.com", group: "Standard", phone: "+15558901234" },
  { id: "9", name: "Ian Taylor", email: "ian@example.com", group: "Standard", phone: "+15559012345" },
  { id: "10", name: "Jane Anderson", email: "jane@example.com", group: "Standard", phone: "+15550123456" },
];

type MemberSelectionProps = {
  messageSubject: string;
  messageContent: string;
  messageCategory: string;
  onSendComplete: () => void;
  disabled: boolean;
};

const MemberSelection = ({ messageSubject, messageContent, messageCategory, onSendComplete, disabled }: MemberSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendChannel, setSendChannel] = useState<'email' | 'whatsapp'>('email');
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const { toast } = useToast();

  const filteredMembers = mockMembers.filter(
    member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(memberId => memberId !== id)
        : [...prev, id]
    );
  };

  const sendMessage = async () => {
    setSending(true);
    
    try {
      const selectedMemberDetails = mockMembers.filter(member => 
        selectedMembers.includes(member.id)
      );
      
      if (sendChannel === 'whatsapp') {
        // Send via WhatsApp
        const phoneNumbers = selectedMemberDetails.map(member => member.phone);
        const formattedMessage = `*${messageSubject}*\n\n${messageContent}\n\nCategory: ${messageCategory}`;
        
        const result = await sendBatchWhatsAppMessages(phoneNumbers, formattedMessage);
        
        if (result.success) {
          toast({
            title: "WhatsApp messages sent",
            description: `Successfully sent to ${result.sent} recipients via WhatsApp.`,
          });
        } else {
          toast({
            title: "Some messages failed",
            description: `Sent: ${result.sent}, Failed: ${result.failed}`,
            variant: "destructive"
          });
        }
      } else {
        // Original email sending logic (simulated)
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Email messages sent",
          description: `Your message has been sent to ${selectedMembers.length} members via email.`,
        });
      }
      
      setShowDialog(false);
      setSelectedMembers([]);
      setSelectAll(false);
      onSendComplete();
      
    } catch (error) {
      console.error("Error sending messages:", error);
      toast({
        title: "Error sending messages",
        description: "There was a problem sending your messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendToAll = () => {
    setSelectedMembers(mockMembers.map(member => member.id));
    setSelectAll(true);
    setShowChannelDialog(true);
  };

  const handleSendToSelected = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No members selected",
        description: "Please select at least one member to send the message to.",
        variant: "destructive"
      });
      return;
    }
    setShowChannelDialog(true);
  };
  
  const handleChannelSelect = (channel: 'email' | 'whatsapp') => {
    setSendChannel(channel);
    setShowChannelDialog(false);
    setShowDialog(true);
  };

  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={disabled}
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={disabled}
                  className="bg-club-gold hover:bg-club-gold/90"
                >
                  <UsersRound className="h-4 w-4 mr-2" />
                  Send to All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send to all members</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will send your message to all {mockMembers.length} members. Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSendToAll}>
                    Yes, send to all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              disabled={disabled}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
          </div>

          <div className="border border-gray-200 rounded-md">
            <ScrollArea className="h-[250px]">
              <div className="p-1">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-2 py-2 px-2 hover:bg-gray-50 rounded-md"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleSelectMember(member.id)}
                        disabled={disabled}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {member.group}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                    <p>No members found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {selectedMembers.length} of {filteredMembers.length} members selected
            </p>
            <Button
              onClick={handleSendToSelected}
              disabled={disabled || selectedMembers.length === 0}
              className="bg-club-navy hover:bg-club-navy/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Channel Selection Dialog */}
      <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Messaging Channel</DialogTitle>
            <DialogDescription>
              How would you like to send this message to {selectedMembers.length} recipients?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 my-4">
            <Button
              onClick={() => handleChannelSelect('email')}
              variant="outline"
              className="flex flex-col h-auto py-6 items-center justify-center"
            >
              <Send className="h-10 w-10 mb-2" />
              <span className="text-lg font-medium">Email</span>
              <span className="text-xs text-gray-500 mt-1">Send via email</span>
            </Button>
            
            <Button
              onClick={() => handleChannelSelect('whatsapp')}
              variant="outline"
              className="flex flex-col h-auto py-6 items-center justify-center border-green-500 hover:bg-green-50"
            >
              <MessageSquare className="h-10 w-10 mb-2 text-green-600" />
              <span className="text-lg font-medium text-green-600">WhatsApp</span>
              <span className="text-xs text-gray-500 mt-1">Send via WhatsApp</span>
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowChannelDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {sendChannel === 'whatsapp' ? 'WhatsApp' : 'Email'} Message</DialogTitle>
            <DialogDescription>
              You are about to send this message to {selectedMembers.length} members via {sendChannel === 'whatsapp' ? 'WhatsApp' : 'email'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-2 border p-3 rounded-md bg-gray-50">
            <div>
              <p className="text-xs uppercase text-gray-500">Subject</p>
              <p className="font-medium">{messageSubject}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Category</p>
              <p>{messageCategory}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Message</p>
              <p className="text-sm whitespace-pre-line">{messageContent}</p>
            </div>
          </div>

          {sendChannel === 'whatsapp' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <h3 className="text-sm font-medium flex items-center text-green-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp Delivery Information
              </h3>
              <p className="text-xs text-green-600 mt-1">
                This message will be delivered via WhatsApp to the selected members' phone numbers.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendMessage} 
              disabled={sending} 
              className={sendChannel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-club-navy hover:bg-club-navy/90'}
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  {sendChannel === 'whatsapp' ? (
                    <MessageSquare className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCheck className="h-4 w-4 mr-2" />
                  )}
                  <span>Confirm Send</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberSelection;
