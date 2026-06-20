import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Listing {
  id: string
  buyNowPrice: number | null
  minAcceptPrice: number | null
  status: string
  giftCard: {
    brand: string
    faceValue: number
  }
  createdAt: string
}

interface GiftCard {
  id: string
  brand: string
  faceValue: number
  status: string
  createdAt: string
}

interface TopCard {
  brand: string
  count: number
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
    }),
    {
      name: 'lantana-store',
    }
  )
)