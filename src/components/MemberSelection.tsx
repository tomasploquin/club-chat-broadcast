import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCheck, Search, Send, UsersRound, Check, FileText, Mail } from "lucide-react";

type Member = {
  id: string;
  name: string;
  whatsapp: string;
  first_text: string;
};

type MemberSelectionProps = {
  message: string;
  file?: File | null;
  onSendComplete: () => void;
};

const MemberSelection = ({ message, file, onSendComplete }: MemberSelectionProps) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Minimal CSV parser for this dataset
  function parseCSV(csv: string): Member[] {
    const lines = csv.trim().split('\n');
    const header = lines[0].split(',');
    const firstLastIdx = header.indexOf('first_last_text');
    const indicatifIdx = header.indexOf('indicatif_phone_text');
    const whatsappIdx = header.indexOf('whatapp_phone_number_text');
    const firstTextIdx = header.indexOf('first_text');

    return lines.slice(1).map((line, i) => {
      const cols = line.split(',');
      const name = cols[firstLastIdx]?.trim() || '';
      const indicatif = cols[indicatifIdx]?.trim() || '';
      const whatsappNum = cols[whatsappIdx]?.trim() || '';
      const first_text = cols[firstTextIdx]?.trim() || '';
      
      return {
        id: `${i + 1}`,
        name,
        whatsapp: indicatif && whatsappNum ? `+${indicatif}${whatsappNum}` : '',
        first_text,
      };
    }).filter(m => m.name && m.whatsapp && m.first_text);
  }

  useEffect(() => {
    fetch('/members.csv')
      .then(res => res.text())
      .then(csv => {
        setMembers(parseCSV(csv));
      });
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.whatsapp.includes(searchTerm.replace(/\s+/g, ''))
    );
  }, [searchTerm, members]);

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(memberId)) {
        newSelected.delete(memberId);
      } else {
        newSelected.add(memberId);
      }
      setSelectAll(newSelected.size === filteredMembers.length && filteredMembers.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(member => member.id)));
    }
    setSelectAll(!selectAll);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // Reset selectAll when search term changes as filtered list changes
    setSelectAll(false);
    // Optionally, clear selected members when search changes, or retain them
    // setSelectedMembers(new Set()); 
  };


  const handleSend = async () => {
    if (selectedMembers.size === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one member to send the message to.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    const recipientsData = Array.from(selectedMembers).map(id => {
      const member = members.find(m => m.id === id);
      if (member && member.whatsapp && member.first_text) {
        const number = member.whatsapp.replace(/[^0-9+]/g, '');
        const jid = number.startsWith('+') ? `${number.substring(1)}@s.whatsapp.net` : `${number}@s.whatsapp.net`;
        return { jid, first_text: member.first_text };
      }
      return null; 
    }).filter(Boolean) as { jid: string; first_text: string }[];

    if (recipientsData.length === 0) {
        toast({
            title: "Error",
            description: "Could not find necessary data (JID, first name) for selected members.",
            variant: "destructive"
        });
        setIsSending(false);
        return;
    }

    const formData = new FormData();
    formData.append('message', message);
    formData.append('recipients_data', JSON.stringify(recipientsData));
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('http://localhost:5001/api/send-message-to-selected', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast({
          title: "Success!",
          description: `Message and file (if any) are being processed for ${recipientsData.length} member(s). Backend says: ${result.message}`,
        });
        onSendComplete();
        setSelectedMembers(new Set());
        setSearchTerm('');
        setSelectAll(false);
      } else {
        toast({
          title: "Error Sending",
          description: result.message || "Failed to send message to the backend.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : "Could not connect to the backend.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Select Recipients & Send</h3>
        </div>
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700 mb-1">Find Members</h4>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {filteredMembers.length > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <label htmlFor="selectAllCheckbox" className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    id="selectAllCheckbox"
                    checked={selectAll && filteredMembers.length > 0}
                    onCheckedChange={handleSelectAll}
                    disabled={filteredMembers.length === 0}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectAll ? 'Deselect All' : 'Select All'} ({filteredMembers.length})
                  </span>
                </label>
              </div>
            )}

            <ScrollArea className="h-64 border rounded-md">
              {filteredMembers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-2.5 rounded-md hover:bg-gray-50 cursor-pointer ${selectedMembers.has(member.id) ? 'bg-gray-100' : ''}`}
                      onClick={() => handleSelectMember(member.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={() => handleSelectMember(member.id)}
                          id={`member-${member.id}`}
                        />
                        <div>
                          <label htmlFor={`member-${member.id}`} className="font-medium text-sm text-gray-800 cursor-pointer block">{member.name}</label>
                          <p className="text-xs text-gray-500">{member.whatsapp}</p>
                        </div>
                      </div>
                      {selectedMembers.has(member.id) && <Check className="h-5 w-5 text-green-600" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No members found matching your search.
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-gray-500 pt-1">
              Selected: {selectedMembers.size} member(s)
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700 mb-1">Message Preview</h4>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                {file && (
                  <div className="mb-4 p-3 rounded-lg border bg-gray-50">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="max-h-48 w-full rounded-md object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-line text-sm text-gray-800 bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
                  {message}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button
            onClick={handleSend}
            disabled={isSending || selectedMembers.size === 0}
            className="bg-gray-800 hover:bg-gray-700 min-w-[150px]"
          >
            {isSending ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedMembers.size > 0 ? `${selectedMembers.size} Member(s)` : 'Selected Members'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberSelection;
