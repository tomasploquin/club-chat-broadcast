import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image, X, FileText } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function FileUpload({ onFileSelect, className = '' }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setFileName(null);
          onFileSelect(file);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setPreview(null);
        setFileName(file.name);
        onFileSelect(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setPreview(null);
    setFileName(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded-lg object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : fileName ? (
        <div className="relative bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700 truncate">{fileName}</span>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-4 w-4" />
          Add Image or PDF
        </Button>
      )}
    </div>
  );
} 