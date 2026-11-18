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

インデント、改行、引用符、セミコロンなどの書式は、Oxfmtで自動的に整えます。手で整えたり、レビューで指摘したりしません。

準拠レベル：**必須**

**理由**

書式の好みを人が判断すると、書く人ごとに揺れ、レビューでも本質でない指摘に時間を取られます。フォーマッタに任せれば、誰が書いても、AIが書いても同じ書式になり、差分には意味のある変更だけが残ります。

エディタでは保存時にOxfmtが動くように設定します。

**良い例**

```json title="package.json（一部）"
{
  "scripts": {
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

**悪い例**

```ts
// 手でそろえた空白は、フォーマッタを通すと崩れる
const config = {
  name    : "order-app",
  version : "1.0.0",
};
```

## Oxfmtの設定は既定値から変えない

Oxfmtの設定は既定値のまま使います。既定値から変えるのは、importの並べ替え（`sortImports`）を有効にすることだけです。

準拠レベル：**推奨**

**理由**

既定値を使えば、設定について考える必要がなく、ほかのプロジェクトとも書式がそろいます。Oxfmtの既定値は、1行100文字、インデントはスペース2つ、文字列はダブルクォート、文末にセミコロンを付ける、というものです。

importの並び順は、人が決めるとばらつき、差分も出やすくなるため、並べ替えだけは有効にします。

**良い例**

```json title=".oxfmtrc.json"
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "sortImports": true
}
```

**悪い例**

```json title=".oxfmtrc.json"
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 120,
  "useTabs": true,
  "singleQuote": true,
  "semi": false
}
```

## 対象ごとに決めたLintツールで検査する

JavaScriptとTypeScriptはOxlint、HTMLとJSXのマークアップはMarkuplint、CSSはStylelintで検査します。どのツールも、推奨の設定を土台にします。

準拠レベル：**必須**

**理由**

型の誤用、Hooksの使い方の誤り、アクセシビリティの問題、HTMLの仕様違反などは、人が読んで見つけるより、ツールのほうが確実に見つけられます。対象ごとに得意なツールを使い分けることで、検出できる範囲を広げます。

Oxlintは、Reactとアクセシビリティのルールをプラグインで有効にします。`react/react-in-jsx-scope` は、Reactのimportが必要だった古いJSXの変換向けのルールなので無効にします。

**良い例**

```json title=".oxlintrc.json"
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "import", "react", "jsx-a11y"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "oxc/no-barrel-file": ["error", { "threshold": 0 }],
    "unicorn/filename-case": ["error", { "case": "kebabCase" }]
  },
  "overrides": [
    {
      "files": ["**/*.tsx"],
      "rules": {
        "unicorn/filename-case": ["error", { "cases": { "kebabCase": true, "pascalCase": true } }]
      }
    }
  ]
}
```

```json title=".markuplintrc"
{
  "extends": ["markuplint:recommended"],
  "parser": { "\\.tsx$": "@markuplint/jsx-parser" },
  "specs": { "\\.tsx$": "@markuplint/react-spec" }
}
```

```json title=".stylelintrc.json"
{
  "extends": ["stylelint-config-standard"]
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

## 設定はリポジトリのファイルに書く

フォーマッタとLintの設定は、リポジトリのルートに置いた設定ファイルに書きます。個人のエディタ設定には書きません。

準拠レベル：**必須**

**理由**

設定がリポジトリにあれば、どの環境でも、CIでも、AIが作業するときも同じ結果になります。個人のエディタ設定に書いた内容は、ほかの人の環境やCIには伝わりません。

**良い例**

```text
.
├── .markuplintrc
├── .oxfmtrc.json
├── .oxlintrc.json
├── .stylelintrc.json
└── package.json
```

**悪い例**

```jsonc title="個人のエディタ設定（settings.json）"
// リポジトリには設定ファイルがなく、個人の設定にだけ書いている
{
  "editor.tabSize": 4,
  "prettier.singleQuote": true
}
```

## コミット前とCIで自動実行する

フォーマットとLintは、コミット前とCIの両方で自動的に実行します。CIでは、書式の崩れとLintのエラーがあれば失敗させます。

準拠レベル：**必須**

**理由**

コミット前に実行すれば、問題をその場で直せます。ただし、コミット前の処理は手元で飛ばせるため、最後の砦としてCIでも実行し、問題のあるコードがメインブランチに入らないようにします。コミット前に実行する仕組みは、プロジェクトに合わせて選びます。

**良い例**

```json title="package.json（一部）"
{
  "scripts": {
    "format": "oxfmt",
    "format:check": "oxfmt --check",
    "lint": "npm run lint:script && npm run lint:markup && npm run lint:style",
    "lint:script": "oxlint --deny-warnings --report-unused-disable-directives",
    "lint:markup": "markuplint \"src/**/*.{html,tsx}\"",
    "lint:style": "stylelint \"src/**/*.css\" --max-warnings 0",
    "check": "npm run format:check && npm run lint"
  }
}
```

```yaml title=".github/workflows/check.yml（一部）"
- run: npm ci
- run: npm run check
```

**悪い例**

```yaml title=".github/workflows/check.yml（一部）"
# 失敗してもCIが通ってしまう
- run: npm ci
- run: npm run lint
  continue-on-error: true
```

## 警告を残したままマージしない

Lintの警告も、エラーと同じように、マージする前にすべて解消します。

準拠レベル：**必須**

**理由**

警告を残してよいことにすると、数が増えるにつれて誰も見なくなり、新しく出た重要な警告も埋もれます。警告として出す価値がないルールは、警告を放置するのではなく、設定で無効にします。

CIでは、Oxlintに `--deny-warnings`、Stylelintに `--max-warnings 0` を付けて、警告があれば失敗させます。

**良い例**

```json title="package.json（一部）"
{
  "scripts": {
    "lint:script": "oxlint --deny-warnings",
    "lint:style": "stylelint \"src/**/*.css\" --max-warnings 0"
  }
}
```

**悪い例**

```jsonc title="package.json（一部）"
{
  "scripts": {
    // 警告がいくつあっても成功として扱われる
    "lint:script": "oxlint",
    "lint:style": "stylelint \"src/**/*.css\""
  }
}
```

## Lintのルールを無効にするときは、範囲を絞って理由を書く

Lintのルールをコードの中で無効にするときは、無効にする範囲を1行にし、ルール名と理由を書きます。ファイル全体やすべてのルールを無効にしません。

準拠レベル：**必須**

**理由**

範囲やルールを指定せずに無効にすると、本来検出すべき別の問題まで見逃します。理由が書いていないと、後から読む人は、その無効化がまだ必要なのかを判断できません。

不要になった無効化のコメントは、Oxlintの `--report-unused-disable-directives` で検出します。

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

## 機械的に判定できるルールはLintの設定に入れる

この規約のルールのうち、ツールで判定できるものは、Lintの設定に入れて自動で検出します。レビューで同じ指摘を繰り返したら、Lintのルールにできないかを検討します。

準拠レベル：**推奨**

**理由**

人が覚えて守るルールは、忘れたり見落としたりします。ツールに任せられるものを任せれば、レビューでは設計や仕様の妥当性といった、人にしか判断できないことに集中できます。AIにコードを書かせる場合も、Lintで検出できるルールは確実に守らせられます。

**良い例**

```jsonc title=".oxlintrc.json（一部）"
// ファイル名の記法をLintで検出する
{
  "rules": {
    "unicorn/filename-case": ["error", { "case": "kebabCase" }]
  }
}
```

**悪い例**

```md
<!-- レビューコメント：毎回同じ指摘を手で書いている -->
ファイル名はケバブケースにしてください（3回目）。
```
