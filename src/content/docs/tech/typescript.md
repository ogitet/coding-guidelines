---
title: TypeScript
description: TypeScriptの書き方。型の書き方、anyや型アサーションの扱い、値とモジュールの扱い方を決めます。
---

TypeScriptの書き方を決めます。JavaScriptで書く場面でも、このページのルールのうち型に関わらないものに従います。

名前の付け方は[命名規則](/coding-guidelines/common/naming/)、JSDocの書き方は[コメント](/coding-guidelines/common/comments/)、Reactに固有の書き方は[React](/coding-guidelines/tech/react/)のページで扱います。

多くのルールは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めたOxlintの設定で検出します。

## anyを使わない

`any` 型は使いません。型が分からない値は `unknown` 型で受け取り、型を確かめてから使います。

準拠レベル：**必須**

**理由**

`any` 型の値には、どのような操作をしても型のエラーになりません。`any` は代入した先にも広がり、型で守られていたはずの範囲まで、チェックが効かなくなります。`unknown` 型なら、型を確かめるまで値を使えないため、確かめ忘れをコンパイラが指摘します。

外部から受け取るデータは、[Zod](https://zod.dev/)などのライブラリで、実行時に形を確かめてから型を付けます。

**良い例**

```ts
function parseOrderId(value: unknown): string {
  if (typeof value !== 'string' || value === '') {
    throw new Error('注文番号が文字列ではありません');
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

**良い例**

```ts
const dialog = document.querySelector('#confirm');
if (!(dialog instanceof HTMLDialogElement)) {
  throw new Error('確認ダイアログが見つかりません');
}
dialog.showModal();

const routes = {
  home: '/',
  orders: '/orders/',
} as const satisfies Record<string, string>;
```

**悪い例**

```ts
const dialog = document.querySelector('#confirm') as HTMLDialogElement;
dialog.showModal();

const firstOrder = orders[0]!;
```

## 推論できる型は書かない

変数の初期値などからTypeScriptが推論できる型は、書きません。関数の引数と、exportする関数の戻り値には型を書きます。

準拠レベル：**推奨**

**理由**

推論できる型をわざわざ書くと、コードが長くなるうえ、初期値を変えたときに型の書き換えも必要になります。一方、引数の型は推論できず、exportする関数の戻り値は、ほかのファイルとの約束になるため、書いておくことで意図しない変更に気づけます。

**良い例**

```ts
const taxRate = 0.1;
const items = ['apple', 'orange'];

export function calculateTax(price: number): number {
  return Math.floor(price * taxRate);
}
```

**悪い例**

```ts
const taxRate: number = 0.1;
const items: string[] = ['apple', 'orange'];

export function calculateTax(price) {
  return Math.floor(price * taxRate);
}
```

## enumを使わず、ユニオン型を使う

決まった値の中から1つを選ぶ型は、`enum` ではなく、文字列のユニオン型で定義します。値の一覧も必要な場合は、`as const` を付けた配列から型を作ります。

準拠レベル：**推奨**

**理由**

`enum` は、型を取り除くだけでは消えず、JavaScriptのコードを生成する、TypeScriptに独自の構文です。Node.jsの型の除去機能など、型を取り除くだけのツールでは動きません。ユニオン型なら型を取り除くだけで済み、値は文字列のままなので、APIのデータともそのまま比べられます。

**良い例**

```ts
export const orderStatuses = ['pending', 'paid', 'shipped'] as const;
export type OrderStatus = (typeof orderStatuses)[number];

function isShipped(status: OrderStatus) {
  return status === 'shipped';
}
```

**悪い例**

```ts
export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
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
    case 'pending':
      return '支払い待ち';
    case 'paid':
      return '支払い済み';
    case 'shipped':
      return '発送済み';
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
    case 'pending':
      return '支払い待ち';
    case 'paid':
      return '支払い済み';
    default:
      return '';
  }
}
```

## 引数として受け取ったオブジェクトや配列を書き換えない

関数の引数として受け取ったオブジェクトや配列は、書き換えません。変更した結果が必要なときは、新しいオブジェクトや配列を作って返します。配列は、元の配列を変えない `toSorted()`、`toSpliced()`、`with()` などで操作します。

準拠レベル：**推奨**

**理由**

引数を書き換えると、呼び出し元が持っている値まで変わります。呼び出し元は、関数を呼んだだけで手元の値が変わるとは考えないため、原因を見つけにくい不具合になります。Reactでは、書き換えた値では変更が検知されず、画面が更新されません。

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
const note = order.note ?? '（なし）';
const city = user.address?.city;
```

**悪い例**

```ts
const quantity = item.quantity || 1;
const note = order.note || '（なし）';
const city = user.address && user.address.city;
```

## default exportを使わず、名前付きexportを使う

モジュールから値を公開するときは、名前付きexport（`export function` など）を使います。フレームワークやツールがdefault exportを求めるファイルだけ、default exportを使います。

準拠レベル：**推奨**

**理由**

default exportは、import する側で自由に名前を付けられるため、同じものがファイルごとに別の名前で呼ばれることがあります。名前付きexportなら、どこでも同じ名前で使われ、検索でもまとめて見つかります。エディタの自動importや名前の一括変更も正確に働きます。

**良い例**

```ts
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ja-JP')}円`;
}
```

```ts
import { formatPrice } from '@/utils/format-price';
```

**悪い例**

```ts
export default function (price: number): string {
  return `${price.toLocaleString('ja-JP')}円`;
}
```

```ts
import toYen from '@/utils/format-price';
```
