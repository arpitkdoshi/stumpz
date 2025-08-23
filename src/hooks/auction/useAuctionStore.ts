import { create } from 'zustand'

export type AuctionState = {
  bid: number
}

export type AuctionActions = {
  setState: (state: Partial<AuctionState>) => void
}

export type AuctionStore = AuctionState & AuctionActions

const initialState: AuctionState = {
  bid: 1,
}

export const useAuctionStore = create<AuctionStore>(set => ({
  ...initialState,
  setState: (state: Partial<AuctionState>) => set({ ...state }),
}))
