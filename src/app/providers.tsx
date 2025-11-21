"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { defineChain } from "viem";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { useWalletSync } from "@/hooks/useWalletSync";

// Define Monad chain (menggunakan testnet dulu untuk development)
export const monad = defineChain({
  id: 41455, // Monad mainnet chain ID
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://explorer.monad.xyz",
    },
  },
});

// Configure wagmi
const config = createConfig({
  chains: [monad],
  transports: {
    [monad.id]: http(),
  },
});

const queryClient = new QueryClient();

// Inner component to use hooks
function ProvidersInner({ children }: { children: React.ReactNode }) {
  // Auto-sync wallet to database on any page
  useWalletSync();
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ProvidersInner>
            {children}
          </ProvidersInner>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
