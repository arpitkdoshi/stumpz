import { create } from 'zustand'
import { AuctionStatusValues } from '@/db/schema'

export type AuctionState = {
  bid: number
  status: AuctionStatusValues | ''
  lastUpdated: Date | null
}

export type AuctionActions = {
  setState: (state: Partial<AuctionState>) => void
}

export type AuctionStore = AuctionState & AuctionActions

const initialState: AuctionState = {
  bid: 1,
  status: '',
  lastUpdated: null,
}

export const useAuctionStore = create<AuctionStore>(set => ({
  ...initialState,
  setState: (state: Partial<AuctionState>) => set({ ...state }),
}))
