import { afterEach, expect } from 'bun:test';
import { cleanup } from '@testing-library/react';

// Bun Test 用の jest-dom マッチャー設定
import * as matchers from '@testing-library/jest-dom/matchers';

// マッチャーを手動で拡張
expect.extend(matchers);

// クリーンアップ
afterEach(() => {
  cleanup();
});