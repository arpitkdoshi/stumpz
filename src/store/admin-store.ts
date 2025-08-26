import { createStore } from 'zustand/vanilla'
import { ComboboxOptions } from '@/components/ui/combobox'

export type AdminState = {
  selectedTournamentId: string
  tournaments: ComboboxOptions[]
}

export type AdminActions = {
  setSelectedTournamentId: (selectedTournamentId: string) => void
  setTournaments: (tournaments: ComboboxOptions[]) => void
  addNewTournament: (tournament: ComboboxOptions) => void
  updTournament: (lbl: string, val: string) => void
  rmTournament: () => void
  setAdminStore: (val: Partial<AdminState>) => void
}

export type AdminStore = AdminState & AdminActions

const initialState: AdminState = {
  selectedTournamentId: '',
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
    setSelectedTournamentId: (selectedTournamentId: string) =>
      set({ selectedTournamentId }),
    setTournaments: (tournaments: ComboboxOptions[]) => set({ tournaments }),
    updTournament: (lbl: string, val: string) =>
      set(({ tournaments }) => ({
        tournaments: tournaments.map(t => {
          if (t.value === val) return { label: lbl, value: val }
          return t
        }),
      })),
    rmTournament: () =>
      set(({ tournaments, selectedTournamentId }) => ({
        tournaments: tournaments.filter(s => s.value !== selectedTournamentId),
        selectedTournamentId: '',
      })),
    addNewTournament: (tournament: ComboboxOptions) =>
      set(({ tournaments }) => ({
        tournaments: [tournament, ...tournaments],
        selectedTournamentId: tournament.value,
      })),
    setAdminStore: (val: Partial<AdminState>) => set({ ...val }),
  }))
}
