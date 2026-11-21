---
title: フォーマットとLint
description: コードの書式をそろえるフォーマッタと、問題を検出するLintの使い方。Oxfmt、Oxlint、Markuplint、Stylelintを使います。
---

コードの書式をそろえるフォーマッタと、問題を検出するLintの使い方を決めます。使うツールは次のとおりです。

| 役割 | ツール | 対象 |
| :-- | :-- | :-- |
| フォーマット | [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) | JavaScript、TypeScript、JSX、HTML、CSS、JSON、Markdown |
| Lint | [Oxlint](https://oxc.rs/docs/guide/usage/linter) | JavaScript、TypeScript、JSX |
| Lint | [Markuplint](https://markuplint.dev/) | HTML、JSXのマークアップ |
| Lint | [Stylelint](https://stylelint.io/) | CSS |

このページでは、ツールの使い方と、どのページのルールにも共通する設定を扱います。各技術に固有のルールの設定は、[技術別ルール](/coding-guidelines/tech/html/)の各ページに書きます。

## 書式はOxfmtに任せる

インデント、改行、引用符、セミコロンなどの書式は、Oxfmtで自動的に整えます。手で整えたり、レビューで指摘したりしません。Oxfmtの設定は、プロジェクトのテンプレートに合わせます。

準拠レベル：**必須**

**理由**

フォーマッタに任せれば、誰が書いても、AIが書いても同じ書式になり、差分には意味のある変更だけが残ります。

**良い例**

```ts
const config = {
  name: 'order-app',
  version: '1.0.0',
};
```

**悪い例**

```ts
// 手でそろえた空白は、フォーマッタを通すと崩れる
const config = {
  name    : 'order-app',
  version : '1.0.0',
};
```

## 対象ごとに決めたLintツールで検査する

JavaScriptとTypeScriptはOxlint、HTMLとJSXのマークアップはMarkuplint、CSSはStylelintで検査します。どのツールも推奨の設定を土台にし、設定の全体はプロジェクトのテンプレートに合わせます。

準拠レベル：**必須**

**理由**

型の誤用、Hooksの使い方の誤り、アクセシビリティの問題、HTMLの仕様違反などは、人が読んで見つけるより、ツールのほうが確実に見つけられます。対象ごとに得意なツールを使い分けることで、検出できる範囲を広げます。

Oxlintは、Reactとアクセシビリティのルールをプラグインで有効にします。

**良い例**

```ts title="vite.config.ts（一部）"
lint: {
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'react', 'jsx-a11y'],
  categories: { correctness: 'error', suspicious: 'warn' },
},
```

```json title=".markuplintrc.json（一部）"
{
  "extends": ["markuplint:recommended-react"]
}
```

```json title=".stylelintrc.json（一部）"
{
  "extends": ["stylelint-config-standard", "stylelint-config-recess-order"]
}
```

**悪い例**

```jsonc title="package.json（一部）"
// Lintがなく、問題はレビューで目で探すしかない
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## コミット前とCIで自動実行する

フォーマットとLintは、コミット前とCIの両方で自動的に実行します。CIでは、書式の崩れとLintのエラーがあれば失敗させます。Lintの警告では失敗させません。

準拠レベル：**必須**

**理由**

コミット前に実行すれば、問題をその場で直せます。ただし、コミット前の処理は手元で飛ばせるため、最後の砦としてCIでも実行し、問題のあるコードがメインブランチに入らないようにします。コミット前に実行する仕組みは、プロジェクトに合わせて選びます。

**良い例**

```yaml title=".github/workflows/ci.yml（一部）"
# フォーマットとLintをまとめて実行し、失敗したらCIを止める
- run: npm run check
```

**悪い例**

```yaml title=".github/workflows/ci.yml（一部）"
# 失敗してもCIが通ってしまう
- run: npm run check
  continue-on-error: true
```

## Lintのルールを無効にするときは、範囲を絞って理由を書く

Lintのルールをコードの中で無効にするときは、無効にする範囲を1行にし、ルール名と理由を書きます。ファイル全体やすべてのルールを無効にしません。

準拠レベル：**必須**

**理由**

範囲やルールを指定せずに無効にすると、本来検出すべき別の問題まで見逃します。理由が書いていないと、後から読む人は、その無効化がまだ必要なのかを判断できません。

**良い例**

```tsx
// oxlint-disable-next-line jsx-a11y/no-autofocus -- 検索専用のページで、開いたらすぐ入力できるようにするため
<input type="search" autoFocus />
```

**悪い例**

```tsx
/* oxlint-disable */
<input type="search" autoFocus />
```
