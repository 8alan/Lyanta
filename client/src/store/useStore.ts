import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Store {
  balance: number
  setBalance: (balance: number) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      balance: 0,
      setBalance: (balance) => set({ balance }),
    }),
    {
      name: 'lantana-store',
    }
  )
)