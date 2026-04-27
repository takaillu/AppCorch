# AppCorch — CLAUDE.md

## プロジェクト概要

ゴルフのアプローチ練習用Webアプリ。
100ヤード以内のヤード数をランダム表示し、距離感を鍛える。
**スマートフォンでの使用をメインとし、最終的にiOSネイティブアプリ化を見据えて実装すること。**

---

## ディレクトリ構成

```
AppCorch/
├── CLAUDE.md
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js        # 起動・画面制御
│   ├── timer.js       # タイマーロジック
│   ├── levels.js      # ヤードセット定義
│   └── speech.js      # 音声読み上げ
└── assets/
    └── favicon.ico
```

---

## スマートフォン対応要件（必須）

メインの使用環境はスマートフォン（特にiPhone）。以下を必ず実装すること。

### レイアウト
- モバイルファースト設計。PC対応は不要
- タップターゲットは最小44px以上
- 縦持ち（portrait）での使用を想定した縦長レイアウト
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`を必ず入れる
- `vh`単位はiOS Safariでアドレスバー分ずれるため`dvh`を使うか固定レイアウトにする
- iPhoneのホームインジケーター対策：フッター要素に`padding-bottom: env(safe-area-inset-bottom)`を付与

### タップ操作
- タップ時のハイライトを消す：`-webkit-tap-highlight-color: transparent`
- ホバー演出はスマホでは不要。`:active`で代替する

### フォント・描画
- `-webkit-font-smoothing: antialiased`を設定
- 文字サイズは最小16px以上（iOS Safariの自動ズーム防止）

### PWA設定（ホーム画面追加対応）
以下をindex.htmlに追加する。

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="AppCorch">
```

---

## iOS互換性の注意事項

将来的にCapacitor（WebViewラッパー）でiOSアプリ化する前提で実装する。

### 音声（重要）
- `SpeechSynthesis`はiOS Safariでユーザー操作（タップ）をトリガーにしないと発話しない
- 自動再生は不可。**初回タップ後からのみ音声を有効化する**
- 非対応環境では無音で動作継続（エラーを出さない）

### タイマー
- `setTimeout`だけだとバックグラウンド時に遅延して狂う
- **`Date.now()`で経過時間を計算する実装**にすること

### ストレージ
- `localStorage`はCapacitorでも使えるが、将来的に`@capacitor/preferences`への移行を考慮してラップしておく

---

## 機能仕様

### レベルとヤードセット

```javascript
const LEVELS = {
  beginner: {
    name: '初心者',
    color: '#1D9E75',
    yards: [5, 10, 20, 30, 50, 80]
  },
  intermediate: {
    name: '中級者',
    color: '#378ADD',
    yards: [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100]
  },
  advanced: {
    name: '上級者',
    color: '#D85A30',
    yards: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  }
};
```

### タイマー
- デフォルト：30秒
- 調整範囲：10〜60秒（5秒刻み）
- 実装：`Date.now()`ベースで経過時間を計算
- プログレスバー：CSS `scaleX`アニメーション
- ポーズ再開後は全体時間から再スタート

### 画面構成
1. **SCR-01 レベル選択画面**：起動時。選んだら練習開始、途中変更不可
2. **SCR-02 練習画面**：ヤード表示・タイマー・ポーズ/次へ/終了ボタン・ショットカウント・直近10件の履歴
3. **SCR-03 サマリー画面**：総ショット数・練習時間（分）・練習ヤード一覧（重複除去・昇順）

### ランダム表示ルール
- 直前と同じヤード数は出さない
- フラッシュアニメーション（フェードアウト→フェードイン、150ms）で切り替え

---

## 将来のiOSアプリ化手順（参考）

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init AppCorch com.appCorch.app
npx cap add ios
npx cap copy
npx cap open ios
```

XcodeでビルドしてApp Store Connect提出。Apple Developer Program（年$99）が必要。

