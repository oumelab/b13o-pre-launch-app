import { create } from 'zustand';

interface Banner {
  id: string;
  type: 'success' | 'error';
  message: string;
  description?: string;
  isClosing?: boolean;
}

interface NotificationBannerStore {
  banner: Banner | null;
  showBanner: (banner: Omit<Banner, 'id'>) => void;
  hideBanner: () => void;
}

export const useNotificationBannerStore = create<NotificationBannerStore>((set, get) => ({
  banner: null,
  
  showBanner: (bannerData) => {
    const banner = {
      ...bannerData,
      id: Date.now().toString(),
      isClosing: false,
    };
    
    set({ banner });
    
    // 5秒後に自動非表示
    setTimeout(() => {
      get().hideBanner();
    }, 5000);
  },

    hideBanner: () => {
    const currentBanner = get().banner;
    if (!currentBanner) return;
    
    // 1. 閉じるフラグを立てる（アニメーション開始）
    set({ 
      banner: { 
        ...currentBanner, 
        isClosing: true 
      } 
    });
    
    // 2. アニメーション完了後にバナーを削除
    setTimeout(() => {
      set({ banner: null });
    }, 300); // アニメーション時間と合わせる
  },
}));