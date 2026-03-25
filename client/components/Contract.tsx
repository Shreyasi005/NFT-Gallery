"use client";

import { useState, useCallback } from "react";
import {
  mintNFT,
  getNFT,
  getAllNFTs,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#ec4899]/30 focus-within:shadow-[0_0_20px_rgba(236,72,153,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "gallery" | "mint" | "view";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

interface NFTData {
  owner: string;
  name: string;
  uri: string;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [nftName, setNftName] = useState("");
  const [nftUri, setNftUri] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  const [viewId, setViewId] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [singleNft, setSingleNft] = useState<NFTData | null>(null);

  const [allNfts, setAllNfts] = useState<NFTData[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const truncateMid = (addr: string) => addr.length > 16 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  const loadGallery = useCallback(async () => {
    setIsLoadingGallery(true);
    try {
      const result = await getAllNFTs(walletAddress || undefined);
      if (Array.isArray(result)) {
        setAllNfts(result as NFTData[]);
      } else {
        setAllNfts([]);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
      setAllNfts([]);
    } finally {
      setIsLoadingGallery(false);
    }
  }, [walletAddress]);

  // Load gallery when tab changes to gallery
  const handleTabChange = useCallback(async (tab: Tab) => {
    setActiveTab(tab);
    setError(null);
    setSingleNft(null);
    if (tab === "gallery") {
      await loadGallery();
    }
  }, [loadGallery]);

  const handleMintNFT = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!nftName.trim() || !nftUri.trim()) return setError("Fill in all fields");
    setError(null);
    setIsMinting(true);
    setTxStatus("Awaiting signature...");
    try {
      await mintNFT(walletAddress, nftName.trim(), nftUri.trim());
      setTxStatus("NFT minted successfully!");
      setNftName("");
      setNftUri("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsMinting(false);
    }
  }, [walletAddress, nftName, nftUri]);

  const handleViewNFT = useCallback(async () => {
    const id = parseInt(viewId.trim());
    if (isNaN(id)) return setError("Enter a valid NFT ID (number)");
    setError(null);
    setIsViewing(true);
    setSingleNft(null);
    try {
      const result = await getNFT(id, walletAddress || undefined);
      if (result && typeof result === "object") {
        setSingleNft(result as NFTData);
      } else {
        setError("NFT not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsViewing(false);
    }
  }, [viewId, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "gallery", label: "Gallery", icon: <ImageIcon />, color: "#ec4899" },
    { key: "mint", label: "Mint", icon: <PlusIcon />, color: "#a855f7" },
    { key: "view", label: "View", icon: <SearchIcon />, color: "#22d3ee" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("success") || txStatus.includes("successfully") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ec4899]/20 to-[#a855f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ec4899]">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">NFT Gallery</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Gallery */}
            {activeTab === "gallery" && (
              <div className="space-y-5">
                <MethodSignature name="get_all" params="()" returns="-> Vec<NFT>" color="#ec4899" />
                
                <ShimmerButton onClick={loadGallery} disabled={isLoadingGallery} shimmerColor="#ec4899" className="w-full">
                  {isLoadingGallery ? <><SpinnerIcon /> Loading...</> : <><RefreshIcon /> Refresh Gallery</>}
                </ShimmerButton>

                {allNfts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                    {allNfts.map((nft, idx) => (
                      <div 
                        key={idx} 
                        className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up cursor-pointer hover:border-[#ec4899]/30 transition-all"
                        onClick={() => { setViewId(String(idx)); handleTabChange("view"); }}
                      >
                        {/* Image placeholder or actual image */}
                        <div className="aspect-square bg-gradient-to-br from-[#ec4899]/10 to-[#a855f7]/10 flex items-center justify-center">
                          {nft.uri ? (
                            <img src={nft.uri} alt={nft.name} className="w-full h-full object-cover" onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }} />
                          ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          )}
                        </div>
                        <div className="p-3 border-t border-white/[0.06]">
                          <p className="text-sm font-medium text-white/80 truncate">{nft.name}</p>
                          <p className="text-[10px] text-white/30 font-mono mt-1">{truncateMid(nft.owner)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-white/15 mb-3">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    <p className="text-sm text-white/35">No NFTs yet</p>
                    <p className="text-[10px] text-white/20 mt-1">Mint your first NFT to get started</p>
                  </div>
                )}
              </div>
            )}

            {/* Mint */}
            {activeTab === "mint" && (
              <div className="space-y-5">
                <MethodSignature name="mint" params="(owner: Address, name: String, uri: String)" color="#a855f7" />
                <Input label="NFT Name" value={nftName} onChange={(e) => setNftName(e.target.value)} placeholder="e.g. Cosmic Dreams #1" />
                <Input label="Image URI" value={nftUri} onChange={(e) => setNftUri(e.target.value)} placeholder="e.g. https://ipfs.io/ipfs/..." />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handleMintNFT} disabled={isMinting} shimmerColor="#a855f7" className="w-full">
                    {isMinting ? <><SpinnerIcon /> Minting...</> : <><PlusIcon /> Mint NFT</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#a855f7]/20 bg-[#a855f7]/[0.03] py-4 text-sm text-[#a855f7]/60 hover:border-[#a855f7]/30 hover:text-[#a855f7]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to mint NFTs
                  </button>
                )}
              </div>
            )}

            {/* View */}
            {activeTab === "view" && (
              <div className="space-y-5">
                <MethodSignature name="get_nft" params="(id: u32)" returns="-> Option<NFT>" color="#22d3ee" />
                <Input label="NFT ID" type="number" value={viewId} onChange={(e) => setViewId(e.target.value)} placeholder="e.g. 0" />
                <ShimmerButton onClick={handleViewNFT} disabled={isViewing} shimmerColor="#22d3ee" className="w-full">
                  {isViewing ? <><SpinnerIcon /> Loading...</> : <><SearchIcon /> View NFT</>}
                </ShimmerButton>

                {singleNft && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="aspect-video bg-gradient-to-br from-[#22d3ee]/10 to-[#ec4899]/10 flex items-center justify-center">
                      {singleNft.uri ? (
                        <img src={singleNft.uri} alt={singleNft.name} className="w-full h-full object-contain" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Name</span>
                        <span className="font-mono text-sm text-white/80">{singleNft.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Owner</span>
                        <span className="font-mono text-xs text-white/60">{truncateMid(singleNft.owner)}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">URI</span>
                        <span className="font-mono text-xs text-white/60 max-w-[60%] text-right break-all">{singleNft.uri || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">NFT Gallery &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#ec4899]" />
                <span className="font-mono text-[9px] text-white/15">{allNfts.length} NFTs</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
