---
title: TypeScript
description: TypeScriptの書き方。コンパイラの設定、型の書き方、anyや型アサーションの扱い、変数・比較・例外・モジュールの書き方を決めます。
---

TypeScriptの書き方を決めます。JavaScriptで書く場面でも、このページのルールのうち型に関わらないものに従います。

名前の付け方は[命名規則](/coding-guidelines/common/naming/)、JSDocの書き方は[コメントとドキュメント](/coding-guidelines/common/comments-and-docs/)、Reactに固有の書き方は[React](/coding-guidelines/tech/react/)のページで扱います。

このページのルールのうち、Oxlintで検出できるものは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めた設定に次の内容を加えて有効にします。

```json title=".oxlintrc.json（追加分）"
{
  "rules": {
    "typescript/no-explicit-any": "error",
    "typescript/no-non-null-assertion": "error",
    "typescript/ban-ts-comment": [
      "error",
      { "ts-ignore": true, "ts-nocheck": true, "ts-expect-error": "allow-with-description" }
    ],
    "typescript/no-inferrable-types": "error",
    "typescript/consistent-type-definitions": ["error", "type"],
    "typescript/consistent-type-imports": "error",
    "eslint/eqeqeq": "error",
    "eslint/no-var": "error",
    "eslint/prefer-const": "error",
    "eslint/no-param-reassign": ["error", { "props": true }],
    "eslint/no-throw-literal": "error",
    "import/no-default-export": "error"
  },
  "overrides": [
    {
      "files": ["*.config.{js,mjs,ts}"],
      "rules": { "import/no-default-export": "off" }
    }
  ]
}
```

## JavaScriptではなくTypeScriptで書く

コードはTypeScriptで書き、拡張子は `.ts`（JSXを含む場合は `.tsx`）にします。ツールの設定ファイルなど、JavaScriptでしか書けないファイルだけをJavaScriptで書きます。

準拠レベル：**必須**

**理由**

型があれば、引数の渡し間違いや、存在しないプロパティの参照を、実行する前に見つけられます。エディタの補完や、名前の一括変更も正確になります。AIにコードを書かせる場合も、型の誤りはコンパイラが指摘するため、誤りに気づきやすくなります。

**良い例**

```text
src/features/cart/
├── CartSummary.tsx
├── calculate-total.ts
└── use-cart.ts
```

**悪い例**

```text
src/features/cart/
├── CartSummary.jsx
├── calculate-total.js
└── use-cart.js
```

## コンパイラの厳しいチェックを有効にする

`tsconfig.json` では、`strict` と `noUncheckedIndexedAccess` を有効にします。`strict` は、TypeScriptの既定値にかかわらず明示的に書きます。

準拠レベル：**必須**

**理由**

`strict` を有効にすると、`null` や `undefined` の扱い漏れ、型の分からない引数などをコンパイラが指摘します。`noUncheckedIndexedAccess` を有効にすると、配列やオブジェクトから添字で取り出した値に `undefined` の可能性が含まれ、存在しない要素を使う誤りを防げます。

`verbatimModuleSyntax` と `erasableSyntaxOnly` は、このページのほかのルールのために有効にします。

**良い例**

```json title="tsconfig.json（一部）"
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true
  }
}
```

**悪い例**

```json title="tsconfig.json（一部）"
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

## 型チェックをCIで実行する

`tsc --noEmit` による型チェックを、フォーマットとLintと合わせてCIで実行し、型のエラーがあれば失敗させます。

準拠レベル：**必須**

**理由**

ViteやAstroなどのビルドツールの多くは、速さのために型を取り除くだけで、型のチェックはしません。ビルドが通っても型のエラーが残っていることがあるため、型チェックを別に実行します。

**良い例**

```json title="package.json（一部）"
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "check": "npm run format:check && npm run lint && npm run typecheck"
  }
}
```

**悪い例**

```json title="package.json（一部）"
{
  "scripts": {
    "build": "vite build",
    "check": "npm run format:check && npm run lint"
  }
}
```

## anyを使わない

`any` 型は使いません。型が分からない値は `unknown` 型で受け取り、型を確かめてから使います。

準拠レベル：**必須**

**理由**

`any` 型の値には、どのような操作をしても型のエラーになりません。`any` は代入した先にも広がり、型で守られていたはずの範囲まで、チェックが効かなくなります。`unknown` 型なら、型を確かめるまで値を使えないため、確かめ忘れをコンパイラが指摘します。

外部から受け取るデータは、[Zod](https://zod.dev/)などのライブラリで、実行時に形を確かめてから型を付けます。

このルールは、Oxlintの `typescript/no-explicit-any` で検出します。

**良い例**

```ts
function parseOrderId(value: unknown): string {
  if (typeof value !== "string" || value === "") {
    throw new Error("注文番号が文字列ではありません");
  }
  return value;
}
```

**悪い例**

```ts
function parseOrderId(value: any): string {
  return value.trim();
}
```

## asや!で型を上書きしない

型アサーション（`as`）と非nullアサーション（`!`）で、コンパイラが推論した型を上書きしません。型を絞り込むときは、`typeof`、`in`、型ガード関数などで、実際に値を確かめます。`as const` と、値が型に合うかを確かめる `satisfies` は使ってかまいません。

準拠レベル：**推奨**

**理由**

`as` と `!` は、コンパイラに「この値はこの型だ」と言い切らせるだけで、実際の値は確かめません。値が想定と違えば、型のエラーにならないまま、実行したときに不具合が起きます。値を確かめるコードを書けば、型と実際の値が一致します。

非nullアサーションは、Oxlintの `typescript/no-non-null-assertion` で検出します。

**良い例**

```ts
const dialog = document.querySelector("#confirm");
if (!(dialog instanceof HTMLDialogElement)) {
  throw new Error("確認ダイアログが見つかりません");
}
dialog.showModal();

const routes = {
  home: "/",
  orders: "/orders/",
} as const satisfies Record<string, string>;
```

**悪い例**

```ts
const dialog = document.querySelector("#confirm") as HTMLDialogElement;
dialog.showModal();

const firstOrder = orders[0]!;
```

## @ts-ignoreで型のエラーを隠さない

`@ts-ignore` と `@ts-nocheck` は使いません。型のエラーをどうしても避けられないときは、`@ts-expect-error` を使い、理由を書きます。

準拠レベル：**必須**

**理由**

`@ts-ignore` は、次の行の型のエラーをすべて隠します。本来直すべき別のエラーも隠れ、エラーがなくなった後もコメントだけが残ります。`@ts-expect-error` は、エラーがなくなるとそのコメント自体がエラーになるため、不要になった時点で気づけます。

このルールは、Oxlintの `typescript/ban-ts-comment` で検出します。

**良い例**

```ts
// @ts-expect-error -- ライブラリの型定義に onFinish がないため（v3.2で修正予定）
player.onFinish(handleFinish);
```

**悪い例**

```ts
// @ts-ignore
player.onFinish(handleFinish);
```

## 推論できる型は書かない

変数の初期値などからTypeScriptが推論できる型は、書きません。関数の引数と、exportする関数の戻り値には型を書きます。

準拠レベル：**推奨**

**理由**

推論できる型をわざわざ書くと、コードが長くなるうえ、初期値を変えたときに型の書き換えも必要になります。一方、引数の型は推論できず、exportする関数の戻り値は、ほかのファイルとの約束になるため、書いておくことで意図しない変更に気づけます。

推論できるのに書いた型の一部は、Oxlintの `typescript/no-inferrable-types` で検出します。

**良い例**

```ts
const taxRate = 0.1;
const items = ["apple", "orange"];

export function calculateTax(price: number): number {
  return Math.floor(price * taxRate);
}
```

**悪い例**

```ts
const taxRate: number = 0.1;
const items: string[] = ["apple", "orange"];

export function calculateTax(price) {
  return Math.floor(price * taxRate);
}
```

## オブジェクトの型はtypeで定義する

オブジェクトの型は、`interface` ではなく `type` で定義します。

準拠レベル：**推奨**

**理由**

`type` と `interface` のどちらでもオブジェクトの型は書けますが、混ざっていると、使い分けに意味があるのかと読む人を迷わせます。`type` はユニオン型など、オブジェクト以外の型にも使えるため、`type` にそろえます。`interface` には、同じ名前で宣言すると自動的に1つにまとめられる性質があり、意図せず型が広がることがあります。

このルールは、Oxlintの `typescript/consistent-type-definitions` で検出します。

**良い例**

```ts
type Order = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
};
```

**悪い例**

```ts
interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
}
```

## enumを使わず、ユニオン型を使う

決まった値の中から1つを選ぶ型は、`enum` ではなく、文字列のユニオン型で定義します。値の一覧も必要な場合は、`as const` を付けた配列から型を作ります。

準拠レベル：**推奨**

**理由**

`enum` は、型を取り除くだけでは消えず、JavaScriptのコードを生成する、TypeScriptに独自の構文です。Node.jsの型の除去機能など、型を取り除くだけのツールでは動きません。ユニオン型なら型を取り除くだけで済み、値は文字列のままなので、APIのデータともそのまま比べられます。

このルールは、`tsconfig.json` の `erasableSyntaxOnly` で検出します。

**良い例**

```ts
export const orderStatuses = ["pending", "paid", "shipped"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

function isShipped(status: OrderStatus) {
  return status === "shipped";
}
```

**悪い例**

```ts
export enum OrderStatus {
  Pending = "pending",
  Paid = "paid",
  Shipped = "shipped",
}
```

## ユニオン型の分岐は、すべての場合を扱ったことを型で確かめる

ユニオン型の値で `switch` 文を書くときは、`default` 節で値を `never` 型に代入し、すべての場合を扱ったことをコンパイラに確かめさせます。

準拠レベル：**推奨**

**理由**

ユニオン型に値を追加したとき、分岐の追加を忘れると、どの `case` にも当たらずに処理が素通りします。`default` 節で `never` 型に代入しておけば、扱っていない値があるときに型のエラーになり、追加の漏れを書いた時点で見つけられます。

**良い例**

```ts
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "支払い待ち";
    case "paid":
      return "支払い済み";
    case "shipped":
      return "発送済み";
    default: {
      const unexpected: never = status;
      throw new Error(`未対応の状態です：${unexpected}`);
    }
  }
}
```

**悪い例**

```ts
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "支払い待ち";
    case "paid":
      return "支払い済み";
    default:
      return "";
  }
}
```

## 型だけをimportするときはimport typeを使う

型としてだけ使うものは、`import type` で読み込みます。

準拠レベル：**推奨**

**理由**

`import type` で読み込んだものは、型を取り除くときに、import文ごと確実に消えます。普通の `import` で型を読み込むと、ツールによっては、読み込み先のファイルが実行時にも読み込まれ、不要なコードが含まれたり、循環参照の原因になったりします。

このルールは、Oxlintの `typescript/consistent-type-imports` と、`tsconfig.json` の `verbatimModuleSyntax` で検出します。

**良い例**

```ts
import type { Order } from "@/features/order-history/types";
import { formatPrice } from "@/utils/format-price";
```

**悪い例**

```ts
import { Order } from "@/features/order-history/types";
import { formatPrice } from "@/utils/format-price";
```

## 値の比較には===と!==を使う

値の比較には、`===` と `!==` を使います。`==` と `!=` は使いません。

準拠レベル：**必須**

**理由**

`==` は、比べる前に型を変換するため、`0 == ""` や `"1" == 1` が真になるなど、結果を予想しにくくなります。`===` は型も含めて比べるため、書いたとおりの意味になります。

このルールは、Oxlintの `eslint/eqeqeq` で検出します。

**良い例**

```ts
if (order.status === "paid") {
  ship(order);
}
```

**悪い例**

```ts
if (order.quantity == "0") {
  removeItem(order);
}
```

## 変数はconstで宣言する

変数は `const` で宣言します。再代入が必要な場合だけ `let` を使います。`var` は使いません。

準拠レベル：**必須**

**理由**

`const` で宣言すれば、その変数の値が途中で変わらないことが、宣言を見ただけで分かります。`var` は、ブロックの外からも参照でき、宣言より前でも使えるため、意図しない値の共有や上書きが起きます。

このルールは、Oxlintの `eslint/prefer-const` と `eslint/no-var` で検出します。

**良い例**

```ts
const items = await fetchCartItems();
let total = 0;
for (const item of items) {
  total += item.price;
}
```

**悪い例**

```ts
var items = await fetchCartItems();
let shippingFee = 500;
var total = 0;
for (var i = 0; i < items.length; i++) {
  total += items[i].price;
}
```

## 引数として受け取ったオブジェクトや配列を書き換えない

関数の引数として受け取ったオブジェクトや配列は、書き換えません。変更した結果が必要なときは、新しいオブジェクトや配列を作って返します。

準拠レベル：**推奨**

**理由**

引数を書き換えると、呼び出し元が持っている値まで変わります。呼び出し元は、関数を呼んだだけで手元の値が変わるとは考えないため、原因を見つけにくい不具合になります。Reactでは、書き換えた値では変更が検知されず、画面が更新されません。

引数のプロパティへの代入は、Oxlintの `eslint/no-param-reassign` で検出します。`push()` などのメソッドによる書き換えは検出できません。配列は、元の配列を変えない `toSorted()`、`toSpliced()`、`with()` などで操作します。`sort()` で書き換えていることは、Oxlintの `unicorn/no-array-sort` で検出します。

**良い例**

```ts
function addItem(cart: Cart, item: CartItem): Cart {
  return { ...cart, items: [...cart.items, item], total: cart.total + item.price };
}

function sortByDate(orders: readonly Order[]): Order[] {
  return orders.toSorted((a, b) => a.orderedAt.localeCompare(b.orderedAt));
}
```

**悪い例**

```ts
function addItem(cart: Cart, item: CartItem): Cart {
  cart.items.push(item);
  cart.total += item.price;
  return cart;
}

function sortByDate(orders: Order[]): Order[] {
  return orders.sort((a, b) => a.orderedAt.localeCompare(b.orderedAt));
}
```

## 値がない場合の既定値には??を使う

値が `null` か `undefined` のときに既定値を使う場合は、`||` ではなく `??` を使います。深い階層のプロパティを参照するときは、`?.` を使います。

準拠レベル：**推奨**

**理由**

`||` は、`0`、空の文字列、`false` のときにも既定値に置き換えます。数量の `0` や、意図して空にした文字列が、既定値で上書きされてしまいます。`??` は `null` と `undefined` のときだけ既定値を使うため、意図どおりになります。

**良い例**

```ts
const quantity = item.quantity ?? 1;
const note = order.note ?? "（なし）";
const city = user.address?.city;
```

**悪い例**

```ts
const quantity = item.quantity || 1;
const note = order.note || "（なし）";
const city = user.address && user.address.city;
```

## throwするのはErrorオブジェクトだけにする

`throw` するのは、`Error` か、`Error` を継承したクラスのオブジェクトだけにします。文字列や、ただのオブジェクトは `throw` しません。

準拠レベル：**推奨**

**理由**

`Error` オブジェクトには、エラーが起きた場所を示すスタックトレースが記録されます。文字列を `throw` すると、どこでエラーが起きたのかを追えません。受け取る側も、`instanceof` で種類を見分けたり、`message` を共通の方法で読んだりできなくなります。

このルールは、Oxlintの `eslint/no-throw-literal` で検出します。

**良い例**

```ts
class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`注文が見つかりません：${orderId}`);
    this.name = "OrderNotFoundError";
  }
}

throw new OrderNotFoundError(orderId);
```

**悪い例**

```ts
throw "注文が見つかりません";
throw { code: 404, orderId };
```

## default exportを使わず、名前付きexportを使う

モジュールから値を公開するときは、名前付きexport（`export function` など）を使います。フレームワークやツールがdefault exportを求めるファイルだけ、default exportを使います。

準拠レベル：**推奨**

**理由**

default exportは、import する側で自由に名前を付けられるため、同じものがファイルごとに別の名前で呼ばれることがあります。名前付きexportなら、どこでも同じ名前で使われ、検索でもまとめて見つかります。エディタの自動importや名前の一括変更も正確に働きます。

このルールは、Oxlintの `import/no-default-export` で検出します。default exportが必要なファイルは、設定の `overrides` で除外します。

**良い例**

```ts
export function formatPrice(price: number): string {
  return `${price.toLocaleString("ja-JP")}円`;
}
```

```ts
import { formatPrice } from "@/utils/format-price";
```

**悪い例**

```ts
export default function (price: number): string {
  return `${price.toLocaleString("ja-JP")}円`;
}
```

```ts
import toYen from "@/utils/format-price";
```
