---
title: ディレクトリ構成
description: ソースコードを置くディレクトリの分け方。機能単位でまとめ、依存の向きを一方向にします。
---

ソースコードを置くディレクトリの分け方を決めます。ファイル名とディレクトリ名の記法は[命名規則](/coding-guidelines/common/naming/)、画像の置き場所は[画像](/coding-guidelines/common/images/)のページで扱います。

全体の形は次のとおりです。`pages/` の部分は、使うフレームワークの規約に合わせて名前や形が変わります。なお、このページのコード例の `@/` は、`src/` を指すパスの別名です。

```text
src/
├── pages/                # ページ（フレームワークの規約がある場合は従う）
├── features/             # 機能ごとのディレクトリ
│   ├── cart/
│   │   ├── CartSummary.tsx
│   │   ├── CartSummary.test.tsx
│   │   ├── use-cart.ts
│   │   └── calculate-total.ts
│   └── order-history/
├── components/           # 複数の機能で使うコンポーネント
├── hooks/                # 複数の機能で使うフック
└── utils/                # 複数の機能で使う関数
```

## フレームワークが決める構成に従う

フレームワークがディレクトリの名前や置き場所を決めている部分は、その規約に従います。この規約のほかのルールは、フレームワークが決めていない部分に適用します。

準拠レベル：**必須**

**理由**

Astroの `src/pages/` のように、置き場所でルーティングや動作が決まるディレクトリがあります。独自の構成に変えると、フレームワークの機能が使えなくなったり、公式ドキュメントと対応が取れなくなったりします。

**良い例**

```text
src/
├── pages/
│   ├── index.astro
│   └── cart.astro
└── features/
    └── cart/
        └── CartSummary.tsx
```

**悪い例**

```text
src/
├── routes/               # フレームワークは pages/ を前提にしている
│   └── cart.astro
└── features/
    └── cart/
        └── CartSummary.tsx
```

## 機能単位でディレクトリをまとめる

コンポーネント、フック、関数などは、ファイルの種類ではなく、属する機能ごとに `src/features/` の下へまとめます。

準拠レベル：**推奨**

**理由**

1つの機能を直すときに触るファイルが、1つのディレクトリに集まります。種類ごとに分けると、カートの修正のために `components/`、`hooks/`、`utils/` を行き来することになり、どのファイルがどの機能のものかも分かりにくくなります。機能を削除するときも、ディレクトリごと消せば済みます。

**良い例**

```text
src/features/
├── cart/
│   ├── CartSummary.tsx
│   ├── use-cart.ts
│   └── calculate-total.ts
└── order-history/
    ├── OrderHistoryList.tsx
    └── use-order-history.ts
```

**悪い例**

```text
src/
├── components/
│   ├── CartSummary.tsx
│   └── OrderHistoryList.tsx
├── hooks/
│   ├── use-cart.ts
│   └── use-order-history.ts
└── utils/
    └── calculate-total.ts
```

## 複数の機能で使うものだけを共通のディレクトリに置く

`src/components/`、`src/hooks/`、`src/utils/` には、2つ以上の機能で使うものだけを置きます。1つの機能でしか使わないものは、その機能のディレクトリに置きます。

準拠レベル：**推奨**

**理由**

「いつか使い回すかもしれない」という理由で共通のディレクトリに置くと、そこが何でも入る場所になり、どの機能が何に依存しているかが分からなくなります。最初は機能のディレクトリに置き、2つ目の機能で必要になった時点で移します。

**良い例**

```text
src/
├── components/
│   └── Button.tsx              # cart と order-history の両方で使う
└── features/
    └── cart/
        └── CartItemRow.tsx     # cart でしか使わない
```

**悪い例**

```text
src/
├── components/
│   ├── Button.tsx
│   └── CartItemRow.tsx         # cart でしか使わないのに共通に置いている
└── features/
    └── cart/
```

## 依存の向きを「ページ → 機能 → 共通」の一方向にする

ページは機能と共通のものを、機能は共通のものだけをimportします。機能から別の機能や、共通のものから機能をimportしません。

準拠レベル：**推奨**

**理由**

依存の向きがそろっていれば、ある機能を変えたときの影響が、その機能とそれを使うページに限られます。機能どうしが互いにimportし合うと、変更の影響が読めなくなり、循環importも起きやすくなります。2つの機能を組み合わせたいときは、ページ側で両方をimportして組み合わせます。

**良い例**

```tsx
// src/pages/CartPage.tsx
import { CartSummary } from "@/features/cart/CartSummary";
import { RecommendedItems } from "@/features/recommendation/RecommendedItems";

export function CartPage() {
  return (
    <>
      <CartSummary />
      <RecommendedItems />
    </>
  );
}
```

**悪い例**

```tsx
// src/features/cart/CartSummary.tsx
import { RecommendedItems } from "@/features/recommendation/RecommendedItems";

export function CartSummary() {
  return (
    <section>
      {/* … */}
      <RecommendedItems />
    </section>
  );
}
```

## 関連するファイルは対象と同じ場所に置く

テストなど、特定のファイルに付随するファイルは、対象のファイルと同じディレクトリに、同じ名前で置きます。

準拠レベル：**推奨**

**理由**

対象とテストが並んでいれば、テストがあるかどうかが一目で分かり、対象を移動・削除するときにも一緒に扱えます。`__tests__/` や `tests/` のように別の場所にまとめると、対象とテストの対応が崩れやすくなります。テストの書き方は[テスト方針](/coding-guidelines/quality/testing/)で扱います。

**良い例**

```text
src/features/cart/
├── CartSummary.tsx
├── CartSummary.test.tsx
├── calculate-total.ts
└── calculate-total.test.ts
```

**悪い例**

```text
src/features/cart/
├── CartSummary.tsx
└── calculate-total.ts
tests/
└── cart/
    ├── cart-summary.test.tsx
    └── total.test.ts
```

## 再エクスポートするだけのファイルを作らない

ほかのファイルの中身を `export … from` で並べ直すだけの `index.ts`（バレルファイル）は作りません。importするときは、定義しているファイルを直接指定します。

準拠レベル：**推奨**

**理由**

バレルファイルを経由すると、使わないモジュールまで読み込まれ、開発サーバーやテストが遅くなります。循環importの原因にもなります。また、エディタで定義元へ移動したときに、まずバレルファイルに飛ばされます。

`export *` を使ったバレルファイルは、Oxlintの `oxc/no-barrel-file` で `threshold` を `0` にして検出します。設定は[フォーマットとLint](/coding-guidelines/common/format-and-lint/)を参照してください。

**良い例**

```ts
import { CartSummary } from "@/features/cart/CartSummary";
import { calculateTotal } from "@/features/cart/calculate-total";
```

**悪い例**

```ts
// src/features/cart/index.ts
export * from "./CartSummary";
export * from "./calculate-total";
export * from "./use-cart";
```

```ts
import { CartSummary, calculateTotal } from "@/features/cart";
```

## 何でも入る名前のファイルを作らない

`utils.ts`、`helpers.ts`、`common.ts` のように、何でも入れられる名前のファイルを作りません。関数は、内容を表す名前のファイルに分けて置きます。

準拠レベル：**推奨**

**理由**

何でも入る名前のファイルは、関係のない関数が増え続け、どこに何があるかが分からなくなります。ファイル名で中身が分かれば、探すときも、使われなくなって消すときも迷いません。

**良い例**

```text
src/utils/
├── format-price.ts
├── parse-query-string.ts
└── sleep.ts
```

**悪い例**

```text
src/
├── utils.ts            # formatPrice、parseQueryString、sleep … が1つに入っている
└── helpers/
    └── common.ts
```

## ディレクトリは必要になってから分ける

機能のディレクトリの中は、ファイルが少ないうちは分けずに並べます。ファイルが増えて探しにくくなってから、`components/` などのサブディレクトリに分けます。

準拠レベル：**推奨**

**理由**

ファイルが数個しかないうちから細かく分けると、階層が深くなるだけで探しやすさは変わりません。importのパスも長くなります。分ける目安は、1つのディレクトリのファイルがおよそ10個を超えたときです。

**良い例**

```text
src/features/cart/
├── CartSummary.tsx
├── CartItemRow.tsx
├── use-cart.ts
└── calculate-total.ts
```

**悪い例**

```text
src/features/cart/
├── components/
│   └── summary/
│       └── CartSummary.tsx
├── hooks/
│   └── use-cart.ts
└── utils/
    └── calculate-total.ts
```
