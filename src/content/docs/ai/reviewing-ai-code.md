---
title: AIが書いたコードのレビュー基準
description: AIエージェントが書いたコードをレビューするときの基準。AIのコードで起きやすい問題と、その確かめ方。
---

AIエージェントが書いたコードをレビューするときの基準を決めます。AIが書いたコードも、人が書いたコードと同じく[レビューのチェックリスト](/coding-guidelines/quality/review-checklist/)の基準でレビューします。このページでは、そのうえで、AIが書いたコードで特に起きやすい問題と、その確かめ方を扱います。

AIへの指示の書き方は、[AIエージェントへの指示方法](/coding-guidelines/ai/agent-instructions/)を参照してください。

## AIの報告を信じず、自分で実行して確かめる

AIが「テストが通った」「動作を確認した」と報告しても、テスト、Lint、ビルドを自分の環境かCIで実行し、画面の変更はブラウザで確かめてからマージします。

準拠レベル：**必須**

**理由**

AIの報告は、実際の実行結果と異なることがあります。途中で失敗したコマンドを成功として報告したり、実行していない確認を済んだと書いたりします。実行結果を自分で見なければ、報告が正しいかは分かりません。

ブラウザでの確かめ方は、[検証](/coding-guidelines/quality/verification/)のページで扱います。

**良い例**

```text
npm test        → 通過（CIでも通過）
npm run check   → 通過
npm run build   → 通過
ブラウザ        → 注文一覧でキャンセル済みの注文が表示されないことを確認
```

**悪い例**

```text
AIの報告に「テストと動作確認は完了しました」とあったので、マージします。
```

## 依頼した範囲の外の変更を差し戻す

差分に、依頼した範囲の外の変更（関係のないファイルの書き換え、ついでのリファクタリング、名前の変更など）があれば、その変更を取り除かせます。範囲の外で直すべき問題があれば、別の依頼に分けます。

準拠レベル：**必須**

**理由**

AIは、依頼の達成に必要ない箇所まで「改善」することがあります。範囲の外の変更が混ざると差分が大きくなり、本来の変更を確かめにくくなります。依頼していない変更は、意図して確かめたものではないため、不具合が入っても気づけません。

差分の全体は `git diff --stat` で確かめます。

**良い例**

```text
$ git diff --stat main
 src/features/order-history/OrderHistoryList.tsx      |  6 +++--
 src/features/order-history/filter-orders.ts          | 12 ++++++++
 src/features/order-history/filter-orders.test.ts     | 24 ++++++++++++++++
 3 files changed, 40 insertions(+), 2 deletions(-)
```

**悪い例**

```text
$ git diff --stat main
 package.json                                         |  3 +-
 src/components/Button.tsx                            | 18 ++++-----
 src/features/cart/use-cart.ts                        | 41 ++++++++----------
 src/features/order-history/OrderHistoryList.tsx      |  6 +++--
 src/features/order-history/filter-orders.ts          | 12 ++++++++
 src/utils/format-price.ts                            |  9 ++--
 6 files changed, 57 insertions(+), 32 deletions(-)
```

## 実在し、使っている版で有効なAPIか確かめる

AIが使った関数、コンポーネント、オプションが、プロジェクトで使っている版のライブラリに実在し、非推奨になっていないかを、型チェックと公式のドキュメントで確かめます。

準拠レベル：**必須**

**理由**

AIは、もっともらしい名前の存在しないAPIを書いたり、古い版のAPIを書いたりします。存在しないAPIの多くは型チェックで見つかりますが、非推奨になったAPIや、型が `any` のオプションは型チェックを通ってしまいます。確かめるときは、`package.json` にある版のドキュメントを見ます。

**良い例**

```tsx
// React 19 では useActionState を react から読み込む
import { useActionState } from "react";

const [state, formAction] = useActionState(submitOrder, initialState);
```

**悪い例**

```tsx
// React 19 で非推奨になった、以前の版のAPIを使っている
import { useFormState } from "react-dom";

const [state, formAction] = useFormState(submitOrder, initialState);
```

## 追加された依存パッケージが、実在する意図したパッケージかを確かめる

AIが依存パッケージを追加したときは、npmのレジストリと公式のドキュメントで、そのパッケージが実在し、名前が意図したパッケージと完全に一致しているかを確かめます。一致しなければ、追加を取り消させます。

準拠レベル：**必須**

**理由**

AIは、もっともらしい名前の、存在しないパッケージを挙げることがあります。AIがよく挙げる存在しない名前を先回りして登録し、悪意のあるコードを仕込んだパッケージが公開されている場合もあります。名前を確かめずにインストールすると、そのコードが手元とCIで実行されます。

追加する必要があるか、信頼できるかの確かめ方は、人が追加する場合と同じです。[セキュリティ](/coding-guidelines/quality/security/#依存パッケージは追加する前に必要性と信頼性を確かめる)のページを参照してください。

**良い例**

```sh
# インストールする前に、公開者、リポジトリ、更新日を確かめる
npm view react-error-boundary repository.url maintainers time.modified
```

**悪い例**

```sh
# AIが挙げた名前を、確かめずにそのままインストールする
npm install react-error-boundry
```

## テスト、型、Lintを回避して通していないか確かめる

差分に、テストの削除やスキップ、期待値の緩和、`any` や `@ts-ignore`、Lintの無効化コメント、エラーを握りつぶす `catch` がないかを確かめます。見つけたら、回避せずに原因を直させます。

準拠レベル：**必須**

**理由**

AIは「テストとLintを通す」ことを目標にすると、コードを直す代わりに、検査のほうを弱めて通すことがあります。そうすると検査が通っていても、不具合は残ったままです。特に、テストの期待値を実装の結果に合わせて書き換える変更は、差分が小さく見落としやすいため、テストファイルの差分は1行ずつ読みます。

回避に使われやすい書き方は、差分を検索して見つけます。

**良い例**

```sh
# 差分のうち、追加された行から回避に使われやすい書き方を探す
git diff main | grep -nE '^\+.*(\.skip|\.only|@ts-ignore|@ts-expect-error|as any|: any|oxlint-disable|catch \{)'
```

```ts
// 期待値はそのままにし、実装の誤りを直している
expect(calculateTotal(items)).toBe(3300);
```

**悪い例**

```diff title="calculate-total.test.ts の差分"
-  expect(calculateTotal(items)).toBe(3300);
+  expect(calculateTotal(items)).toBeGreaterThan(0);
```

## 既にある関数やコンポーネントと重複していないか確かめる

AIが新しく作った関数、フック、コンポーネントについて、同じ役割のものが既にないかを確かめます。あれば、既にあるものを使うように直させます。

準拠レベル：**推奨**

**理由**

AIは、作業に必要なファイルしか読まないことが多く、既にある共通の関数を知らないまま、似たものを新しく作ります。重複すると、片方だけが直されて動作が食い違います。

**良い例**

```ts title="src/features/order-history/OrderSummary.tsx（一部）"
import { formatPrice } from "@/utils/format-price";
```

**悪い例**

```ts title="src/features/order-history/OrderSummary.tsx（一部）"
// src/utils/format-price.ts に同じ役割の関数がある
function formatOrderPrice(price: number) {
  return `${price.toLocaleString("ja-JP")}円`;
}
```

## 不要な処理と、使われない汎用化を削る

起こりえない場合への分岐、何もしない `try` / `catch`、どこからも使われない引数やオプション、処理を言い換えただけのコメントは削らせます。

準拠レベル：**推奨**

**理由**

AIは、念のための処理や、将来使うかもしれない汎用化を書き足しがちです。型で起こりえないと分かっている分岐や、使われないオプションは、読む量とテストすべき組み合わせを増やすだけです。エラーを握りつぶす `catch` は、不具合の原因を隠します。コメントの書き方は[コメントとドキュメント](/coding-guidelines/common/comments-and-docs/)を参照してください。

**良い例**

```ts
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ja-JP")}円`;
}
```

**悪い例**

```ts
type FormatPriceOptions = { locale?: string; suffix?: string; fallback?: string };

// 価格をフォーマットする
export function formatPrice(price: number, options: FormatPriceOptions = {}): string {
  const { locale = "ja-JP", suffix = "円", fallback = "" } = options;
  // price は number 型なので、この分岐に入ることはない
  if (price === null || price === undefined) {
    return fallback;
  }
  try {
    return `${price.toLocaleString(locale)}${suffix}`;
  } catch {
    return fallback;
  }
}
```

## 規約から外れた報告は、理由を確かめてから受け入れる

AIが規約の必須・推奨のルールから外れたと報告したときは、その理由が[準拠レベルの定義](/coding-guidelines/about/compliance-levels/)で外れてよい場合に当たるかを確かめます。当たらなければ、規約どおりに直させます。

準拠レベル：**必須**

**理由**

AIは、作業を早く終えるために規約から外れ、もっともらしい理由を添えて報告することがあります。報告されたことだけで受け入れると、必須のルールでも「時間がない」に近い理由で外れることを認めてしまいます。理由に挙げられたライブラリの制約などは、実際にその制約があるかを確かめます。

**良い例**

```text
【AIの報告】
src/lib/chart.ts で any を使った。chart-lib 3.2 の型定義で、onClick の引数の型が any になっているため。

【レビュー】
chart-lib 3.2 の型定義で該当箇所を確かめた。理由のとおりで、規約の例外のコメントも書いてある。受け入れる。
```

**悪い例**

```text
【AIの報告】
型エラーを解消するため、any を使った。

【レビュー】
報告があるので受け入れる。
```

## 同じ指摘を繰り返したら、LintかAGENTS.mdに反映する

AIが書いたコードに同じ指摘を繰り返したら、その内容をLintの設定か `AGENTS.md` に反映します。Lintで検出できるものはLintに、できないものは `AGENTS.md` に書きます。

準拠レベル：**推奨**

**理由**

AIは前の作業でのレビューの指摘を覚えていないため、指示かLintに反映しない限り、同じ誤りを繰り返します。Lintに入れたものは、AIが作業中に自分で検出して直せます。Lintで判定できない方針は、`AGENTS.md` の書き方（[AIエージェントへの指示方法](/coding-guidelines/ai/agent-instructions/)）に沿って追記します。

**良い例**

```json title=".oxlintrc.json（一部）"
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/legacy/*"],
            "message": "src/legacy/ は削除予定のため、新しいコードから import しない"
          }
        ]
      }
    ]
  }
}
```

```md title="AGENTS.md（一部）"
- 価格の表示には `src/utils/format-price.ts` の `formatPrice` を使う。表示の形式をこの関数にまとめているため
```

**悪い例**

```md
<!-- レビューコメント：作業のたびに同じ指摘を手で書いている -->
価格の表示は、既にある formatPrice を使ってください（3回目）。
```
