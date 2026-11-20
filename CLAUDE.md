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
- フォーマットとLint：Oxfmt（フォーマット）、Oxlint（JavaScript / TypeScript）、Markuplint（HTML / JSX）、Stylelint（CSS）
- 機械的に判定できるルールはLintの設定に落とす
- 技術スタックは app-template リポジトリ（https://github.com/ogitet/app-template）を正とし、規約には書かない
- テスト：Vitest（単体）、Testing Library（コンポーネント）、Playwright（E2E、ビジュアルリグレッション）
- Git：GitHub Flow、マージはマージコミット、コミットメッセージはConventional Commits（要約は日本語）
- 主な対象技術：HTML / CSS / TypeScript / React

## 各ページの書式

1. ルール（1〜2文で言い切る）
2. 準拠レベル：必須／推奨／任意
3. 理由
4. 良い例・悪い例（コード付き）

1章（はじめに）は説明ページなので、この書式を取らない。

「レビューのチェックリスト」は、レビューの進め方のルールをこの書式で書き、末尾に各ページへのリンク付きのチェック項目を置く。チェック項目は観点だけにし、ルールの中身は書かない。

本文はです・ます調で書き、一人称は「私」にする。

改訂履歴（`about/changelog.md`）の扱い：

- 全ページがそろうまでは記録しない。そろった時点で「初版を公開しました」の1行だけを日付付きで記録し、「初版の公開前のため、まだ記録はありません。」の文を消す
- 初版の公開後は、ルールやページを追加・変更・削除したら、履歴の先頭に日付付きで記録する
- 誤字の修正や、意味の変わらない言い回しの調整は記録しない

Reactのページは、H2を分類（コンポーネント設計 / Hooks / 状態管理とデータ取得 / パフォーマンス）、H3を各ルールにする。

## 構成

章とディレクトリの対応。サイドバーは `astro.config.mjs` に明示しているため、ページを追加・改名したらサイドバーと、トップページ（`src/content/docs/index.mdx`）の章の一覧も更新する。

| 章 | ディレクトリ |
| :-- | :-- |
| 1. はじめに | `src/content/docs/about/` |
| 2. 共通ルール | `src/content/docs/common/` |
| 3. 技術別ルール | `src/content/docs/tech/` |
| 4. 品質と開発フロー | `src/content/docs/quality/`（AIエージェントへの指示方法を含む） |

- 2章は言語やフレームワークに依らないルール、3章は技術ごとのルールを置く（1技術1ページ）
- ファイル名（URL）は英語のケバブケース、`title` は日本語にする
- `base` が `/coding-guidelines` のため、本文中の内部リンクは `/coding-guidelines/` から始める

### 置き場所の線引き

同じルールを複数のページに書かない。関係するページからはリンクする。

- alt属性はアクセシビリティのページに書く。画像のページからはリンクする
- 画像のページは、形式、サイズと圧縮、`srcset` / `picture`、`width` / `height`、遅延読み込み、SVGの扱い、ファイル名と置き場所を扱う
- アクセシビリティに関わるルールはアクセシビリティのページに書き、HTML / CSS / Reactのページからはリンクする
- 対応するブラウザとデバイスの範囲は「対応ブラウザとデバイス」で決め、それをどう確かめるか（実機確認、HTMLバリデータ、axe、Lighthouse、キーボード操作など）は「検証」に書く
- 自動テスト（単体、E2E、ビジュアルリグレッション）は「テスト方針」に書く
- 識別子・ファイル・ディレクトリの名前の記法は「命名規則」に書く。CSSのクラス名の付け方はCSSのページ、画像のファイル名は画像のページに書く
- 速さに関わるルールは「パフォーマンス」に書く。ただし画像は画像のページ、Reactの描画の最適化はReactのページ、スクリプトの読み込み方はHTMLのページ、計測の方法と目標は「検証」に書く

## コマンド

- `npm run dev`：開発サーバー起動（`http://localhost:4321/coding-guidelines/`）
- `npm run build`：`dist/` にビルド。`llms.txt` 類もここで生成される
- `npm run preview`：ビルド結果の確認

Astro自体の作業上の注意は `AGENTS.md` を参照する。

## 作業ルール

- 出力とコミットメッセージは日本語で書く
- コミットメッセージは、この規約の「Git」のとおり `種類: 要約` の形にする（本文の追加・修正は `docs:`）。種類のない既存のコミットは書き換えない
- 変更は作業ブランチで行い、プルリクエスト経由で `main` に取り込む。`main` へ直接pushしない（利用者から明示された場合だけ例外）
- 判断に迷う点は作業前に質問する
- 参考にする公開規約は構成の参考のみとし、文章は流用しない

## 参考にする公開規約

- ディーゼロ：https://guidelines.d-zero.co.jp/ （章立て、Git・命名まで含む範囲の決め方）
- デパート：https://depart-develop.github.io/coding-guidelines/pdf/depart-coding-guidelines.pdf （必須／推奨ラベル、改訂履歴）
- バーンワークス：https://burnworks.com/docs/guidelines/ （運用ルール）
- フューチャー：https://future-architect.github.io/coding-standards （トップページの見せ方）
- SmartHR：eslint-plugin-smarthr （規約をLintで守らせる構成）
