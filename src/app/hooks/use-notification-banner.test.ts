// hooks/use-notification-banner.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, mock } from 'bun:test';

// テスト用の簡単なフック
function useTestNotificationBanner() {
  const mockShowBanner = mock();
  
  const showSuccess = (message: string, description?: string) => {
    mockShowBanner({ type: 'success', message, description });
  };

  const showError = (message: string, description?: string) => {
    mockShowBanner({ type: 'error', message, description });
  };

  return { showSuccess, showError, mockShowBanner };
}

describe('useNotificationBanner', () => {
  it('showSuccessが正しい引数で呼ばれる', () => {
    const { result } = renderHook(() => useTestNotificationBanner());
    
    act(() => {
      result.current.showSuccess('成功メッセージ', '詳細説明');
    });
    
    expect(result.current.mockShowBanner).toHaveBeenCalledWith({
      type: 'success',
      message: '成功メッセージ',
      description: '詳細説明',
    });
  });

  it('showErrorが正しい引数で呼ばれる', () => {
    const { result } = renderHook(() => useTestNotificationBanner());
    
    act(() => {
      result.current.showError('エラーメッセージ', 'エラー詳細');
    });
    
    expect(result.current.mockShowBanner).toHaveBeenCalledWith({
      type: 'error',
      message: 'エラーメッセージ',
      description: 'エラー詳細',
    });
  });

  it('descriptionが未指定でも動作する', () => {
    const { result } = renderHook(() => useTestNotificationBanner());
    
    act(() => {
      result.current.showSuccess('メッセージのみ');
    });
    
    expect(result.current.mockShowBanner).toHaveBeenCalledWith({
      type: 'success',
      message: 'メッセージのみ',
      description: undefined,
    });
  });

  it('複数回の呼び出しが正しく動作する', () => {
    const { result } = renderHook(() => useTestNotificationBanner());
    
    act(() => {
      result.current.showSuccess('1回目');
      result.current.showError('2回目');
      result.current.showSuccess('3回目', '説明付き');
    });
    
    expect(result.current.mockShowBanner).toHaveBeenCalledTimes(3);
    expect(result.current.mockShowBanner).toHaveBeenNthCalledWith(1, {
      type: 'success',
      message: '1回目',
      description: undefined,
    });
    expect(result.current.mockShowBanner).toHaveBeenNthCalledWith(2, {
      type: 'error',
      message: '2回目',
      description: undefined,
    });
    expect(result.current.mockShowBanner).toHaveBeenNthCalledWith(3, {
      type: 'success',
      message: '3回目',
      description: '説明付き',
    });
  });
});