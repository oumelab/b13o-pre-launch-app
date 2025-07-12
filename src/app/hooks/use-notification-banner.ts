import { useNotificationBannerStore } from "@/stores/notification-banner-store";

export function useNotificationBanner() {
  const showBanner = useNotificationBannerStore(state => state.showBanner);
  
  const showSuccess = (message: string, description?: string) => {
    showBanner({ type: 'success', message, description });
  };

  const showError = (message: string, description?: string) => {
    showBanner({ type: 'error', message, description });
  };

  return { showSuccess, showError };
}