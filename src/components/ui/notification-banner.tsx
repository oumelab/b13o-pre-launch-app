'use client';

import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNotificationBannerStore } from '@/stores/notification-banner-store';
import { useState, useEffect } from 'react';

export function NotificationBanner() {
  const { banner, hideBanner } = useNotificationBannerStore();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // バナーの表示/非表示制御
  useEffect(() => {
    if (banner && !banner.isClosing) {
      // 新しいバナーが表示される時
      setShouldRender(true);
      // 少し遅延してアニメーション開始
      setTimeout(() => setIsVisible(true), 10);
    } else if (banner?.isClosing) {
      // バナーが閉じる時
      setIsVisible(false);
      // アニメーション完了後にレンダリング停止
      setTimeout(() => setShouldRender(false), 300);
    } else if (!banner) {
      // バナーがnullになった時
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [banner]);

  // レンダリングしない場合
  if (!shouldRender) return null;

  const isSuccess = banner?.type === 'success';
  
  return (
    <div className={`
      border-b shadow-sm transition-all duration-300 ease-out
      ${isSuccess 
        ? 'bg-green-900/30 border-green-500 text-green-100' 
        : 'bg-red-900/30 border-red-500 text-red-100'
      }
      ${isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 -translate-y-full'
      }
    `}>
      {/* アクセント線 */}
      <div className={`h-[1px] transition-all duration-300 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* アイコン */}
            {isSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            
            {/* メッセージ */}
            <div>
              <p className="font-medium">{banner?.message}</p>
              {banner?.description && (
                <p className="text-sm opacity-90 mt-1">{banner.description}</p>
              )}
            </div>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={hideBanner}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            disabled={banner?.isClosing}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}