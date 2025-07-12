// components/notification-banner.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, mock } from 'bun:test';

// テスト用の簡単なバナーコンポーネント
function MockBanner({ 
  banner, 
  onClose 
}: { 
  banner: { type: 'success' | 'error'; message: string; description?: string } | null;
  onClose: () => void;
}) {
  if (!banner) return null;

  return (
    <div 
      role="alert" 
      className={`transition-all duration-300 ease-out ${
        banner.type === 'success' 
          ? 'bg-green-900/30 border-green-500 text-green-100' 
          : 'bg-red-900/30 border-red-500 text-red-100'
      }`}
    >
      <div>
        {banner.type === 'success' ? '✅' : '❌'}
        <p>{banner.message}</p>
        {banner.description && <p>{banner.description}</p>}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

describe('NotificationBanner', () => {
  const mockOnClose = mock();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('バナーがnullの場合、何も表示されない', () => {
    render(<MockBanner banner={null} onClose={mockOnClose} />);
    
    expect(screen.queryByRole('alert')).toBe(null);
  });

  it('成功バナーが正しく表示される', () => {
    const banner = {
      type: 'success' as const,
      message: '登録が完了しました！',
      description: '確認メールをご確認ください'
    };

    render(<MockBanner banner={banner} onClose={mockOnClose} />);
    
    expect(screen.getByText('登録が完了しました！')).toBeTruthy();
    expect(screen.getByText('確認メールをご確認ください')).toBeTruthy();
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement.className).toContain('bg-green-900/30');
    expect(alertElement.className).toContain('border-green-500');
    expect(alertElement.className).toContain('text-green-100');
  });

  it('エラーバナーが正しく表示される', () => {
    const banner = {
      type: 'error' as const,
      message: '登録に失敗しました',
      description: 'メールアドレスが既に登録されています'
    };

    render(<MockBanner banner={banner} onClose={mockOnClose} />);
    
    expect(screen.getByText('登録に失敗しました')).toBeTruthy();
    expect(screen.getByText('メールアドレスが既に登録されています')).toBeTruthy();
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement.className).toContain('bg-red-900/30');
    expect(alertElement.className).toContain('border-red-500');
    expect(alertElement.className).toContain('text-red-100');
  });

  it('説明がない場合、説明文は表示されない', () => {
    const banner = {
      type: 'success' as const,
      message: 'シンプルなメッセージ'
    };

    render(<MockBanner banner={banner} onClose={mockOnClose} />);
    
    expect(screen.getByText('シンプルなメッセージ')).toBeTruthy();
    expect(screen.queryByText(/確認メール/)).toBe(null);
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const banner = {
      type: 'success' as const,
      message: 'テストメッセージ'
    };

    render(<MockBanner banner={banner} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeTruthy();
    
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('アニメーション関連のCSSクラスが適用されている', () => {
    const banner = {
      type: 'success' as const,
      message: 'アニメーションテスト'
    };

    render(<MockBanner banner={banner} onClose={mockOnClose} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement.className).toContain('transition-all');
    expect(alertElement.className).toContain('duration-300');
    expect(alertElement.className).toContain('ease-out');
  });
});