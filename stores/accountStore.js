import { create } from 'zustand'

export const useAccountStore = create((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  updateAccountStatus: (account_number, status, actionType) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.account_number === account_number
          ? {
              ...acc,
              status:
                actionType === 'unblock'
                  ? status === 'done'
                    ? 'active'
                    : acc.status
                  : status === 'done'
                  ? 'frozen'
                  : acc.status,
            }
          : acc
      ),
    })),
}))