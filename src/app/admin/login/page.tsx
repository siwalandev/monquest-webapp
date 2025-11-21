"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivy } from "@privy-io/react-auth";
import { IoMail, IoLockClosed, IoGameController, IoWallet } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
    const [hasProcessedAuth, setHasProcessedAuth] = useState(false);
    const { login, loginWithWallet, isAuthenticated } = useAuth();
    const { login: privyLogin, ready: privyReady, authenticated, user: privyUser, getAccessToken } = usePrivy();
    const router = useRouter();

    // Redirect if already authenticated (use useEffect, not direct call in body)
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            toast.success("Login successful!");
            router.push("/admin");
        } else {
            toast.error(result.error || "Invalid credentials");
        }

        setIsLoading(false);
    };

    // Watch for Privy authentication
    useEffect(() => {
        const handlePrivyAuth = async () => {
            // Only proceed if we're loading, Privy authenticated, and haven't processed yet
            if (!isLoading || !authenticated || !privyUser || hasProcessedAuth) {
                return;
            }

            // Mark as processed immediately to prevent re-runs
            setHasProcessedAuth(true);

            console.log("🔐 Privy authenticated, processing wallet login...");

            try {
                // Debug: Log full Privy user object
                console.log("🔍 Full Privy user object:", privyUser);

                // Get wallet address from Privy user (check both possible structures)
                let walletAddress = privyUser.wallet?.address;

                // If wallet is in linked_accounts
                if (!walletAddress && privyUser.linkedAccounts) {
                    const walletAccount = privyUser.linkedAccounts.find(
                        (account: any) => account.type === 'wallet'
                    ) as any;
                    walletAddress = walletAccount?.address;
                }

                console.log("👛 Wallet address:", walletAddress);

                if (!walletAddress) {
                    console.error("❌ No wallet address found in Privy user");
                    console.log("Available accounts:", privyUser.linkedAccounts);
                    toast.error("No wallet address found. Please connect a wallet.");
                    setIsLoading(false);
                    setHasProcessedAuth(false); // Reset flag for retry
                    return;
                }

                // Create message for backend verification
                const message = `Sign in to Monquest Admin Panel\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

                console.log("🔑 Getting Privy access token...");

                // Get Privy access token (this verifies the wallet ownership)
                const accessToken = await getAccessToken();

                console.log("✅ Access token received:", accessToken ? "Yes" : "No");

                if (!accessToken) {
                    console.error("❌ Failed to get access token");
                    toast.error("Failed to get access token");
                    setIsLoading(false);
                    setHasProcessedAuth(false); // Reset flag for retry
                    return;
                }

                console.log("📡 Sending login request to backend...");

                // Login to our backend with Privy token
                const result = await loginWithWallet(walletAddress, accessToken, message);

                console.log("📥 Backend response:", result);

                if (result.success) {
                    toast.success("Wallet connected successfully!");
                    router.push("/admin");
                } else {
                    toast.error(result.error || "Failed to authenticate");
                    setIsLoading(false);
                    setHasProcessedAuth(false); // Reset flag for retry
                }
            } catch (error) {
                console.error("❌ Privy auth error:", error);
                toast.error("Failed to authenticate with wallet");
                setIsLoading(false);
                setHasProcessedAuth(false); // Reset flag for retry
            }
        };

        handlePrivyAuth();
    }, [authenticated, privyUser, isLoading, hasProcessedAuth, getAccessToken, loginWithWallet, router]);

    const handleWalletLogin = async () => {
        if (!privyReady) {
            toast.error("Wallet authentication is loading...");
            return;
        }

        // Reset processed flag when starting new login
        setHasProcessedAuth(false);
        setIsLoading(true);

        try {
            // Open Privy login modal
            await privyLogin();

            // The useEffect above will handle the rest after Privy authentication
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <Toaster position="top-right" />

            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <IoGameController className="text-5xl text-green-400" />
                        <h1 className="text-3xl font-bold text-white">Monquest</h1>
                    </div>
                    <p className="text-gray-400">Admin Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>

                    {/* Login Method Toggle */}
                    <div className="flex gap-2 mb-6 p-1 bg-gray-700 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setLoginMethod('email')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === 'email'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <IoMail className="inline mr-2" />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginMethod('wallet')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${loginMethod === 'wallet'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <IoWallet className="inline mr-2" />
                            Wallet
                        </button>
                    </div>

                    {loginMethod === 'email' ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="admin@monquest.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <IoLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <IoWallet className="text-6xl text-green-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Connect Your Wallet
                                </h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    Sign in securely with your Web3 wallet
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleWalletLogin}
                                disabled={isLoading || !privyReady}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center justify-center gap-3"
                            >
                                <IoWallet className="text-xl" />
                                {isLoading ? "Connecting..." : !privyReady ? "Loading..." : "Connect Wallet"}
                            </button>

                            <div className="text-center text-sm text-gray-400">
                                <p>Supports MetaMask, Coinbase, Phantom & more</p>
                            </div>
                        </div>
                    )}

                    {/* {loginMethod === 'email' && (
                        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
                            <p className="text-sm text-gray-300 font-mono">
                                Email: admin@monquest.com<br />
                                Password: admin123
                            </p>
                        </div>
                    )} */}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    © 2025 Monquest Siwalandev. All rights reserved.
                </p>
            </div>
        </div>
    );
}
