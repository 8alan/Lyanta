import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Listing {
  id: string
  buyNowPrice: number | null
  minAcceptPrice: number | null
  acceptsExchange: boolean
  status: string
  giftCard: {
    brand: string
    faceValue: number
    status?: string
  }
  bids?: {
    id: string
    status: string
    bidType: string
    cashAmount: number | null
  }[]
  createdAt: string
}

interface GiftCard {
  id: string
  brand: string
  faceValue: number
  status: string
  createdAt: string
  rejectionReason?: string | null
}

interface TopCard {
  brand: string
  count: number
}

interface Trade {
  id: string
  status: string
  tradeType: string
  finalPrice: number | null
  createdAt: string
  listingId: string
  hasReviewed: boolean
  listing: {
    id: string
    giftCard: {
      brand: string
      faceValue: number
      revealed: boolean
      description: string | null
    }
  }
  seller: { username: string | null; name: string | null }
  buyer: { username: string | null; name: string | null }
}

interface Store {
  balance: number
  setBalance: (balance: number) => void
  listings: Listing[]
  setListings: (listings: Listing[]) => void
  cards: GiftCard[]
  setCards: (cards: GiftCard[]) => void
  earnings90: number
  setEarnings90: (earnings: number) => void
  topCards: TopCard[]
  setTopCards: (topCards: TopCard[]) => void
  avatarUrl: string | null
  setAvatarUrl: (avatarUrl: string | null) => void
  myListings: Listing[]
  setMyListings: (listings: Listing[]) => void
  trades: Trade[]
  setTrades: (trades: Trade[]) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      balance: 0,
      setBalance: (balance) => set({ balance }),
      listings: [],
      setListings: (listings) => set({ listings }),
      cards: [],
      setCards: (cards) => set({ cards }),
      earnings90: 0,
      setEarnings90: (earnings90) => set({ earnings90 }),
      topCards: [],
      setTopCards: (topCards) => set({ topCards }),
      avatarUrl: null,
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      myListings: [],
      setMyListings: (myListings) => set({ myListings }),
      trades: [],
      setTrades: (trades) => set({ trades }),
    }),
    {
      name: 'lantana-store',
    }
  )
)