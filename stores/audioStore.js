import { create } from 'zustand'

// Store để quản lý các trạng thái audio
export const useAudioStore = create((set) => ({
  // Các state mặc định
  isMuted: false,
  isDeafened: false,
  botExists: false,
  // Action để toggle mic
  toggleMic: () => set((state) => ({ isMuted: !state.isMuted })),
  
  // Action để toggle deafened (tắt loa)
  toggleDeafened: () => set((state) => ({ isDeafened: !state.isDeafened })),
  
  // Action để set trạng thái mic trực tiếp
  setMicState: (enabled) => set({ isMuted: !enabled }),
  
  // Action để set trạng thái deafened trực tiếp
  setDeafenedState: (enabled) => set({ isDeafened: !enabled }),

  setBotExists: (exists) => set({ botExists: exists }),
}))

// Giữ default export để backward compatibility
export default useAudioStore