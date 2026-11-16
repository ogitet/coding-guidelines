# coding-guidelines

個人用コーディング規約サイトのリポジトリ。

## 目的

- 個人用コーディング規約を公開し、信頼感を高める
- Claudeに規約どおりコーディングさせる

## 決定事項

- サイト構築：Astro Starlight
- プラグイン：starlight-llms-txt（`llms.txt` / `llms-full.txt` / `llms-small.txt` を出力。ページ別Markdownは見送り）
- 公開先：GitHub Pages（`https://ogitet.github.io/coding-guidelines/`）
- 規約本文は `src/content/docs/` 以下のMarkdownを唯一の正とする
- 1ページに複数ルールを並べる（1ルール1ファイルは採らない）
- 機械的に判定できるルールはESLint / Biomeの設定に落とす
- 主な対象技術：HTML / CSS / TypeScript / React

## 各ページの書式

1. ルール（1〜2文で言い切る）
2. 準拠レベル：必須／推奨／任意
3. 理由
4. 良い例・悪い例（コード付き）

## 構成

章とディレクトリの対応。サイドバーは `astro.config.mjs` に明示しているため、ページを追加・改名したらサイドバーも更新する。

| 章 | ディレクトリ |
| :-- | :-- |
| 1. はじめに | `src/content/docs/introduction/` |
| 2. 基本方針 | `src/content/docs/principles/` |
| 3. 共通ルール | `src/content/docs/common/` |
| 4. 言語別ルール | `src/content/docs/languages/` |
| 5. React | `src/content/docs/react/` |
| 6. 品質と運用 | `src/content/docs/quality/` |
| 7. AIとの協働 | `src/content/docs/ai/` |

- ファイル名（URL）は英語のケバブケース、`title` は日本語にする
- `base` が `/coding-guidelines` のため、本文中の内部リンクは `/coding-guidelines/` から始める

## コマンド

- `npm run dev`：開発サーバー起動（`http://localhost:4321/coding-guidelines/`）
- `npm run build`：`dist/` にビルド。`llms.txt` 類もここで生成される
- `npm run preview`：ビルド結果の確認

Astro自体の作業上の注意は `AGENTS.md` を参照する。

## 作業ルール

- 出力とコミットメッセージは日本語で書く
- 判断に迷う点は作業前に質問する
- 構成の確認が済むまで、規約本文は書かない
- 参考にする公開規約は構成の参考のみとし、文章は流用しない

## 参考にする公開規約

- ディーゼロ：https://guidelines.d-zero.co.jp/ （章立て、Git・命名まで含む範囲の決め方）
- デパート：https://depart-develop.github.io/coding-guidelines/pdf/depart-coding-guidelines.pdf （必須／推奨ラベル、改訂履歴）
- バーンワークス：https://burnworks.com/docs/guidelines/ （ライセンス表記、運用ルール）
- フューチャー：https://future-architect.github.io/coding-standards （トップページの見せ方）
- SmartHR：eslint-plugin-smarthr （規約をLintで守らせる構成）
