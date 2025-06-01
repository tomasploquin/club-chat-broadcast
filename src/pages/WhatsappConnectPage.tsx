import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast"; // Assuming you have a toast hook

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const WhatsappConnectPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/status`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.connected) {
        setIsConnected(true);
        setQrCode(null); // Clear QR if connected
        setError(null);
        navigate('/'); // Navigate to main page
      } else {
        setIsConnected(false);
        // If not connected, try to fetch QR code
        fetchQrCode();
      }
    } catch (err: any) {
      console.error("Error fetching WhatsApp status:", err);
      setError(err.message || "Failed to fetch WhatsApp status. Please ensure the backend and WhatsApp bridge are running.");
      toast({
        title: "Status Check Error",
        description: err.message || "Could not fetch WhatsApp status.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, [navigate, toast]);

  const fetchQrCode = async () => {
    if (isConnected) return; // Don't fetch if already connected
    setError(null);
    setIsLoadingQr(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/whatsapp/qr`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.qr_base64) {
        setQrCode(data.qr_base64);
      } else {
        // This case might happen if it connects between status check and QR fetch
        // or if bridge returns no QR when not connected.
        // The main polling loop for fetchStatus (every 3 seconds) will re-trigger status and QR fetching if still not connected.
        setQrCode(null); 
      }
    } catch (err: any) {
      console.error("Error fetching WhatsApp QR code:", err);
      setError(err.message || "Failed to fetch QR code.");
      toast({
        title: "QR Code Error",
        description: err.message || "Could not load QR code.",
        variant: "destructive",
      });
      setQrCode(null);
    } finally {
      setIsLoadingQr(false);
    }
  };

  useEffect(() => {
    fetchStatus(); // Initial status check
  }, [fetchStatus]);

  useEffect(() => {
    if (isConnected) {
      return; // Stop polling if connected
    }

    const intervalId = setInterval(() => {
      fetchStatus();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [isConnected, fetchStatus]);

  if (isLoadingStatus && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checking WhatsApp Connection...</CardTitle>
            <CardDescription>Please wait while we check your WhatsApp connection status.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to WhatsApp</CardTitle>
          <CardDescription>
            {isConnected ? "Successfully connected to WhatsApp!" : "Scan the QR code with your WhatsApp app to connect."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && qrCode && (
            <div className="flex flex-col items-center">
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 border rounded-lg" />
              <p className="mt-2 text-sm text-gray-600">Waiting for you to scan...</p>
            </div>
          )}
          {!isConnected && isLoadingQr && !qrCode && !error && (
             <div className="flex justify-center">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-2">Loading QR code...</p>
            </div>
          )}
          {error && (
            <div className="text-red-600 bg-red-100 p-3 rounded-md text-center">
              <p><strong>Error:</strong> {error}</p>
              <p className="text-sm">Please ensure the backend Flask server and the Go WhatsApp bridge are running correctly.</p>
              <Button onClick={fetchStatus} className="mt-2">Retry Connection</Button>
            </div>
          )}
          {isConnected && (
            <div className="text-green-600 text-center font-semibold">
              <p>Connected! Redirecting you shortly...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsappConnectPage; 