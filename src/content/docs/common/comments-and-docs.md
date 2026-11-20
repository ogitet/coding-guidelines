---
title: コメントとドキュメント
description: コードに書くコメントとJSDoc、リポジトリに置くREADMEの書き方。
---

コードに書くコメントとJSDoc、リポジトリに置くREADMEの書き方を決めます。規約から外れる箇所に書くコメントは[準拠レベルの定義](/coding-guidelines/about/compliance-levels/)、Lintのルールを無効にするコメントは[フォーマットとLint](/coding-guidelines/common/format-and-lint/)のページで扱います。

## コメントは日本語で書く

コメントとJSDocは日本語で書きます。

準拠レベル：**推奨**

**理由**

コメントは、コードだけでは伝わらない意図を正確に伝えるためのものです。書く人と読む人が日本語を使うなら、日本語のほうが細かいニュアンスまで誤解なく書けます。コミットメッセージやプルリクエストとも言語がそろいます。

参加するプロジェクトのコメントが英語で書かれている場合は、そちらに合わせます。

**良い例**

```ts
// 決済代行サービスの仕様で、金額は税込みの整数で送る必要がある
const amount = Math.round(subtotal * (1 + TAX_RATE));
```

**悪い例**

```ts
// zeikomi no seisu de okuru
const amount = Math.round(subtotal * (1 + TAX_RATE));
```

## コードを読めば分かることは書かない

コメントには「何をしているか」ではなく、「なぜそうしているか」を書きます。コードを読めば分かる処理の説明は書きません。

準拠レベル：**推奨**

**理由**

処理を言い換えただけのコメントは、読む量を増やすだけで情報を足しません。コードを変えたときに直し忘れると、コードと食い違って誤解のもとになります。コードから読み取れないのは、その書き方を選んだ理由、外部の仕様による制約、あえて避けた別の方法です。

「何をしているか」を説明したくなったら、まず変数名や関数名で表せないかを考えます。

**良い例**

```ts
// 一覧APIは最大100件しか返さないため、100件ずつ分けて取得する
for (const chunk of splitIntoChunks(ids, 100)) {
  results.push(...(await fetchItems(chunk)));
}
```

**悪い例**

```ts
// idsを100件ずつに分ける
for (const chunk of splitIntoChunks(ids, 100)) {
  // fetchItemsを呼んでresultsに追加する
  results.push(...(await fetchItems(chunk)));
}
```

## exportする関数、コンポーネント、型にはJSDocを書く

ほかのファイルから使う関数、コンポーネント、型には、JSDoc（`/** */`）で役割を書きます。名前と型だけでは伝わらない引数や戻り値は、`@param` と `@returns` で説明します。

準拠レベル：**推奨**

**理由**

JSDocはエディタで使う側に表示されるため、定義を開かなくても使い方が分かります。特に、名前と型からは分からない前提（単位、範囲、空のときの扱い、例外を投げる条件など）は、JSDocに書いておかないと使う側が誤ります。

内容が名前から明らかな引数まで `@param` を書く必要はありません。

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
// 計算する
export function calculateTaxIncludedPrice(price: number, taxRate: number) {
  return Math.floor(price * (1 + taxRate));
}
```

## JSDocに型を書かない

TypeScriptでは、JSDocの `@param` や `@returns` に `{string}` のような型を書きません。型はTypeScriptの型注釈だけに書きます。

準拠レベル：**必須**

**理由**

型を2か所に書くと、片方だけを変えたときに食い違います。TypeScriptが参照するのは型注釈のほうなので、JSDocの型は読む人を誤解させるだけです。

**良い例**

```ts
/**
 * @param userId 取得するユーザーのID
 * @returns ユーザーが存在しない場合は null
 */
export async function fetchUser(userId: string): Promise<User | null> {}
```

**悪い例**

```ts
/**
 * @param {number} userId 取得するユーザーのID
 * @returns {User} ユーザー
 */
export async function fetchUser(userId: string): Promise<User | null> {}
```

## コードを変えたらコメントも直す

コードを変えたときは、そのコードに関係するコメントとJSDocも同じコミットで直します。

準拠レベル：**必須**

**理由**

コードと食い違ったコメントは、コメントがない場合より害があります。読む人はコメントを信じて誤った前提でコードを書いてしまいます。レビューでも、変更した行の近くのコメントが正しいままかを確かめます。

**良い例**

```ts
// 送料無料の基準額。キャンペーン期間中は3,000円に下げている
const FREE_SHIPPING_THRESHOLD = 3000;
```

**悪い例**

```ts
// 送料無料の基準額は5,000円
const FREE_SHIPPING_THRESHOLD = 3000;
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

## READMEにセットアップと主なコマンドを書く

リポジトリのルートの `README.md` には、少なくとも次の内容を書きます。

- そのリポジトリが何か（1〜2文）
- 必要な環境（Node.jsのバージョンなど）
- セットアップの手順
- 主なコマンド（開発サーバーの起動、ビルド、テスト、Lint）

準拠レベル：**推奨**

**理由**

READMEは、リポジトリを初めて開いた人とAIが最初に読むファイルです。ここに手順がそろっていれば、口頭の説明なしで開発を始められます。手順が変わったら、変更と同じプルリクエストでREADMEも直します。

AIに向けた作業上の指示は、READMEではなく `AGENTS.md` に書きます。書き方は[AIエージェントへの指示方法](/coding-guidelines/quality/agent-instructions/)を参照してください。

**良い例**

````md
# order-app

注文管理画面のフロントエンドです。

## 必要な環境

- Node.js 24 以上

## セットアップ

```sh
npm install
cp .env.example .env.local
```

## コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | 開発サーバーを起動する |
| `npm run build` | 本番用にビルドする |
| `npm test` | テストを実行する |
| `npm run lint` | Lintを実行する |
````

**悪い例**

```md
# order-app

開発については担当者に聞いてください。
```
