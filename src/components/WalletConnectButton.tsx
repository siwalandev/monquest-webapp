"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import PixelButton from "@/components/ui/PixelButton";

interface WalletConnectButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  className?: string;
}

export default function WalletConnectButton({ size = "sm", variant = "primary", className = "" }: WalletConnectButtonProps) {
  const { login, logout, ready, authenticated, user, getAccessToken } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Get wallet address when user is authenticated
  useEffect(() => {
    if (authenticated && user) {
      // Get wallet address from Privy user
      let address = user.wallet?.address;
      
      // If wallet is in linked_accounts
      if (!address && user.linkedAccounts) {
        const walletAccount = user.linkedAccounts.find(
          (account: any) => account.type === 'wallet'
        ) as any;
        address = walletAccount?.address;
      }
      
      setWalletAddress(address || null);
    } else {
      setWalletAddress(null);
    }
  }, [authenticated, user]);

  // Format wallet address (0x1234...5678)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    if (!ready) return;
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (!ready) {
    return (
      <PixelButton size={size} variant="secondary" disabled className={className}>
        Loading...
      </PixelButton>
    );
  }

  if (!authenticated || !walletAddress) {
    return (
      <PixelButton size={size} variant={variant} onClick={handleConnect} className={className}>
        Connect Wallet
      </PixelButton>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <PixelButton size={size} variant="secondary" className={className}>
        {formatAddress(walletAddress)}
      </PixelButton>
      <button
        onClick={handleDisconnect}
        className="text-xs text-pixel-light hover:text-red-400 transition-colors"
        title="Disconnect wallet"
      >
        ✕
      </button>
    </div>
  );
}
