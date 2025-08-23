import { createStore } from 'zustand/vanilla'
import { ComboboxOptions } from '@/components/ui/combobox'

export type AdminState = {
  selectedTournament: string
  tournaments: ComboboxOptions[]
}

export type AdminActions = {
  setSelectedTournament: (selectedTournament: string) => void
  setTournaments: (tournaments: ComboboxOptions[]) => void
  addNewTournament: (tournament: ComboboxOptions) => void
  setAdminStore: (val: Partial<AdminState>) => void
}

export type AdminStore = AdminState & AdminActions

const initialState: AdminState = {
  selectedTournament: '',
  tournaments: [],
}

export const initAdminStore = (): AdminState => {
  return initialState
}

export const defaultInitState: AdminState = {
  ...initialState,
}

export const createAdminStore = (iState: Partial<AdminState>) => {
  const initState = {
    ...defaultInitState,
    ...iState,
  }
  return createStore<AdminStore>()(set => ({
    ...initState,
    setSelectedTournament: (selectedTournament: string) =>
      set({ selectedTournament }),
    setTournaments: (tournaments: ComboboxOptions[]) => set({ tournaments }),
    addNewTournament: (tournament: ComboboxOptions) =>
      set(({ tournaments }) => ({
        tournaments: [tournament, ...tournaments],
        selectedTournament: tournament.value,
      })),
    setAdminStore: (val: Partial<AdminState>) => set({ ...val }),
  }))
}
