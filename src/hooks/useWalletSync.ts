"use client";

import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Hook to automatically sync wallet to database when user connects
 * Works on any page (homepage, admin, etc.)
 */
export function useWalletSync() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const hasAttemptedSync = useRef(false);

  useEffect(() => {
    // Reset sync flag when user disconnects
    if (!authenticated) {
      hasAttemptedSync.current = false;
      return;
    }

    // Don't sync if already attempted or not ready
    if (!ready || !authenticated || !user) {
      return;
    }

    // Don't run if already attempted sync for this session
    if (hasAttemptedSync.current) {
      return;
    }

    // Mark as attempted immediately to prevent duplicate calls
    hasAttemptedSync.current = true;

    const syncWallet = async () => {
      try {
        // Get wallet address
        let address = user.wallet?.address;
        if (!address && user.linkedAccounts) {
          const walletAccount = user.linkedAccounts.find(
            (account: any) => account.type === "wallet"
          ) as any;
          address = walletAccount?.address;
        }

        if (!address) {
          console.warn("⚠️ No wallet address found");
          return;
        }

        // Check if already synced in this session
        const syncKey = `wallet_synced_${address}`;
        if (sessionStorage.getItem(syncKey)) {
          console.log("⏭️ Wallet already synced in this session");
          return;
        }

        console.log("🔄 Syncing wallet to database:", address);

        // Wait a bit for Privy to be fully ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          console.warn("⚠️ No access token available");
          return;
        }

        console.log("📡 Access token received, sending to API...");

        // Sync to database
        const message = `Sign in to Monquest\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
        const response = await fetch("/api/auth/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            signature: accessToken,
            message: message,
          }),
        });

        const data = await response.json();
        console.log("📦 API Response:", data);

        if (response.ok && data.success) {
          console.log("✅ Wallet synced to database successfully!", data.user);
          sessionStorage.setItem(syncKey, "true");
        } else {
          console.error("❌ Sync failed:", data.error || response.statusText);
        }
      } catch (error) {
        console.error("❌ Error syncing wallet:", error);
      }
    };

    // Run sync
    syncWallet();
  }, [ready, authenticated, user, getAccessToken]);
}
