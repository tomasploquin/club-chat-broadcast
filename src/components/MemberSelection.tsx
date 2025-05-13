
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCheck, Search, Send, UsersRound } from "lucide-react";

// Mock data for members - in a real app this would come from a database
const mockMembers = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", group: "Executive" },
  { id: "2", name: "Bob Johnson", email: "bob@example.com", group: "Executive" },
  { id: "3", name: "Carol Williams", email: "carol@example.com", group: "VIP" },
  { id: "4", name: "David Brown", email: "david@example.com", group: "VIP" },
  { id: "5", name: "Eve Davis", email: "eve@example.com", group: "Standard" },
  { id: "6", name: "Frank Miller", email: "frank@example.com", group: "Standard" },
  { id: "7", name: "Grace Wilson", email: "grace@example.com", group: "Standard" },
  { id: "8", name: "Hannah Moore", email: "hannah@example.com", group: "Standard" },
  { id: "9", name: "Ian Taylor", email: "ian@example.com", group: "Standard" },
  { id: "10", name: "Jane Anderson", email: "jane@example.com", group: "Standard" },
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

  const sendMessage = () => {
    setSending(true);

    // Simulate API call delay
    setTimeout(() => {
      setSending(false);
      setShowDialog(false);
      
      toast({
        title: "Message sent successfully",
        description: `Your message has been sent to ${selectedMembers.length} members.`,
      });
      
      setSelectedMembers([]);
      setSelectAll(false);
      onSendComplete();
    }, 1500);
  };

  const handleSendToAll = () => {
    setSelectedMembers(mockMembers.map(member => member.id));
    setSelectAll(true);
    setShowDialog(true);
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
    setShowDialog(true);
  };

  return (
    <>
      <Card className="border-club-navy/20">
        <CardHeader className="bg-club-navy bg-opacity-5">
          <CardTitle className="text-xl font-serif">Member Selection</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              disabled={disabled}
            />
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

          <div className="border rounded-md">
            <ScrollArea className="h-[250px] p-2">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 py-2 px-1 hover:bg-gray-100 rounded-md"
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
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {member.group}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No members found</p>
                </div>
              )}
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Message</DialogTitle>
            <DialogDescription>
              You are about to send this message to {selectedMembers.length} members.
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

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendMessage} disabled={sending} className="bg-club-navy hover:bg-club-navy/90">
              {sending ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <CheckCheck className="h-4 w-4 mr-2" />
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
