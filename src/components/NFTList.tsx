import React from 'react';
import { Address } from '@ton/core';
import { TonApi, Item } from '../utility/ton-api';


// Define props interface
interface NFTListProps {
  address: Address;
  onError?: (error: any) => void;
}

// Create a functional component using React.FC
export const NFTList: React.FC<NFTListProps> = ({ address, onError }) => {
  const [nfts, setNfts] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const itemsPerPage = 9; // Show 9 NFTs per page (3x3 grid)
  
  // Create API instance
  const tonApi = React.useMemo(() => new TonApi(), []);

  // Fetch NFTs when component mounts or address changes
  React.useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setPage(1); // Reset to page 1 when address changes
        
        const nftItems = await tonApi.searchItemsFromUser(address.toString());
        
        if (nftItems) {
          setNfts(nftItems.nft_items || []);
          setHasMore((nftItems.nft_items || []).length > itemsPerPage);
        }
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
        setError('Failed to load NFTs');
        if (onError) onError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, onError, tonApi]);

  // Function to load more NFTs
  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Calculate which NFTs to display based on current page
  const displayedNfts = nfts.slice(0, page * itemsPerPage);
  
  // Check if we've reached the end of the list
  React.useEffect(() => {
    setHasMore(page * itemsPerPage < nfts.length);
  }, [page, nfts.length]);

  // Loading state
  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }
  
  // Empty state
  if (!nfts.length) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-900/30 to-orange-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No NFTs Found</h3>
        <p className="text-gray-400 text-sm">Your NFT collection is empty</p>
      </div>
    );
  }
  
  // NFT grid display
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Your NFTs</span>
          <span className="text-sm text-gray-400 font-normal">
            (Non-Fungible Tokens)
          </span>
        </h2>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        NFTs are unique digital assets on TON, representing ownership of digital items like art, collectibles, and more.
      </p>
      
      {/* NFT grid with styling consistent with home tab */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {displayedNfts.map((nft, index) => (
          <div 
            key={index} 
            className="group relative bg-gradient-to-br from-orange-900/10 to-orange-900/5 rounded-xl overflow-hidden border border-orange-500/30 transform transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          >
            {/* NFT Image */}
            <div className="relative h-40 overflow-hidden">
              {nft.metadata?.image ? (
                <img 
                  src={nft.metadata.image} 
                  alt={nft.metadata?.name || "NFT"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : nft.previews?.[0]?.url ? (
                <img 
                  src={nft.previews[0].url} 
                  alt={nft.metadata?.name || "NFT"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-900/20 to-orange-900/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Collection badge */}
              {nft.collection?.name && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-orange-300 border border-orange-500/30">
                  {nft.collection.name}
                </div>
              )}
            </div>
            
            {/* NFT Info */}
            <div className="p-3 border-t border-orange-500/30 bg-gray-900/50 backdrop-blur-sm">
              <h3 className="text-white font-bold text-sm truncate group-hover:text-orange-300 transition-colors">
                {nft.metadata?.name || "Unnamed NFT"}
              </h3>
              
              {/* Action button */}
              <div className="mt-2 flex justify-end">
                <button className="px-3 py-1 text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-md transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button 
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'Load More NFTs'
            )}
          </button>
        </div>
      )}
    </div>
  );
};