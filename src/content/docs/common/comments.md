---
title: コメント
description: コードに書くコメントとJSDocの書き方。
---

コードに書くコメントとJSDocの書き方を決めます。規約から外れる箇所に書くコメントは[準拠レベル](/coding-guidelines/about/compliance/)、Lintのルールを無効にするコメントは[フォーマットとLint](/coding-guidelines/common/format-and-lint/)のページで扱います。

## コメントは日本語で書く

コメントとJSDocは日本語で書きます。

準拠レベル：**推奨**

**理由**

書く人と読む人が日本語を使うなら、日本語のほうが意図を誤解なく伝えられ、コミットメッセージやプルリクエストとも言語がそろいます。参加するプロジェクトのコメントが英語で書かれている場合は、そちらに合わせます。

**良い例**

```ts
// 決済代行サービスの仕様で、金額は税込みの整数で送る必要がある
const amount = Math.round(subtotal * (1 + TAX_RATE));
```

**悪い例**

```ts
// The payment gateway requires a tax-included integer amount
const amount = Math.round(subtotal * (1 + TAX_RATE));
```

## exportする関数、コンポーネント、型にはJSDocを書く

ほかのファイルから使う関数、コンポーネント、型には、JSDoc（`/** */`）で役割を書きます。名前と型だけでは伝わらない引数や戻り値は、`@param` と `@returns` で説明します。`{string}` のような型は書きません。

準拠レベル：**推奨**

**理由**

JSDocはエディタで使う側に表示されるため、定義を開かなくても使い方が分かります。特に、名前と型からは分からない前提（単位、範囲、空のときの扱い、例外を投げる条件など）は、JSDocに書いておかないと使う側が誤ります。

JSDocに型を書くと、型注釈と2か所に書くことになり、片方だけを変えたときに食い違います。

**良い例**

```ts
/**
 * 税込み価格を計算する。1円未満は切り捨てる。
 * @param price 税抜き価格（円）
 * @param taxRate 税率。10%なら 0.1
 */
export function calculateTaxIncludedPrice(price: number, taxRate: number) {
  return Math.floor(price * (1 + taxRate));
}
```

**悪い例**

```ts
/**
 * 計算する
 * @param {number} price
 * @param {number} taxRate
 */
export function calculateTaxIncludedPrice(price: number, taxRate: number) {
  return Math.floor(price * (1 + taxRate));
}
```

## コメントアウトしたコードを残さない

使わなくなったコードは、コメントアウトせずに削除します。

準拠レベル：**必須**

**理由**

過去のコードはGitの履歴に残っているため、必要になれば取り戻せます。コメントアウトしたコードは、読む人に「まだ必要なのか」「戻す予定があるのか」を考えさせ、検索の邪魔にもなります。

**良い例**

```ts
const total = calculateTotal(items);
return formatPrice(total);
```

**悪い例**

```ts
const total = calculateTotal(items);
// const total = items.reduce((sum, item) => sum + item.price, 0);
// return `¥${total}`;
return formatPrice(total);
```

## TODOコメントには対応の条件を書く

後で対応する箇所に残す `TODO` コメントには、何をするかと、いつ・何を受けて対応するかを書きます。Issueがある場合は番号を書きます。

準拠レベル：**推奨**

**理由**

「TODO: 直す」だけでは、何を直すのか、いつ直せるのかが分からず、誰も手を付けないまま残り続けます。対応の条件やIssueが書いてあれば、条件がそろったときに見つけて対応できます。

**良い例**

```ts
// TODO(#128): 決済APIのv2が公開されたら、リトライ処理をAPI側の機能に置き換える
await retry(() => createPayment(order), { times: 3 });
```

**悪い例**

```ts
// TODO: あとで直す
await retry(() => createPayment(order), { times: 3 });
```
