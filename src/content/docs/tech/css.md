---
title: CSS
description: CSSの書き方。クラス名の付け方（CSS ModulesとBEM）、セレクタと詳細度、値の管理、レイアウトとレスポンシブの書き方を決めます。
---

CSSの書き方を決めます。クラス名の付け方もこのページで扱います。

フォーカスの表示、コントラスト比、文字サイズの単位、動きを減らす設定など、アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/quality/accessibility/)のページで扱います。

クラス名の付け方は、Reactで作る場合と、それ以外の場合とで分けます。

| 場合 | 方法 | クラス名の例 |
| :-- | :-- | :-- |
| Reactで作る | CSS Modules | `.title`、`.itemList` |
| Reactを使わない | BEM | `.order-card__title--highlighted` |

このページのルールのうち、Stylelintで検出できるものは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めた設定に次の内容を加えて有効にします。

```json title=".stylelintrc.json（追加分）"
{
  "rules": {
    "selector-max-id": 0,
    "declaration-no-important": true,
    "selector-no-qualifying-type": [true, { "ignore": ["attribute"] }],
    "selector-max-compound-selectors": 3,
    "max-nesting-depth": 2,
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      { "message": "クラス名はBEM（block__element--modifier）の形にしてください" }
    ]
  },
  "overrides": [
    {
      "files": ["**/*.module.css"],
      "rules": {
        "selector-class-pattern": [
          "^[a-z][a-zA-Z0-9]*$",
          { "message": "CSS Modulesのクラス名はキャメルケースにしてください" }
        ]
      }
    }
  ]
}
```

## Reactではスタイルをコンポーネントごとに閉じ込める

Reactで作る場合は、CSS Modulesを使い、コンポーネントごとにCSSファイルを分けます。CSSファイルはコンポーネントと同じディレクトリに置き、名前はコンポーネントと同じにして `.module.css` を付けます。

準拠レベル：**推奨**

**理由**

CSS Modulesは、クラス名をファイルごとに固有の名前へ変換するため、別のコンポーネントと同じクラス名を使っても衝突しません。クラス名の衝突を避けるために長い名前を付ける必要がなくなり、コンポーネントを消したときに、使われなくなったCSSも一緒に消せます。

**良い例**

```text
features/order-history/
├── OrderCard.tsx
└── OrderCard.module.css
```

```tsx title="OrderCard.tsx"
import styles from "./OrderCard.module.css";

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className={styles.root}>
      <h3 className={styles.title}>注文番号 {order.id}</h3>
    </article>
  );
}
```

**悪い例**

```text
src/styles/
└── global.css   # すべてのコンポーネントのスタイルを1つのファイルに書いている
```

```tsx title="OrderCard.tsx"
import "../../styles/global.css";

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="card">
      <h3 className="title">注文番号 {order.id}</h3>
    </article>
  );
}
```

## CSS Modulesのクラス名はキャメルケースにする

CSS Modulesのクラス名は、キャメルケースで付けます。コンポーネントの一番外側の要素は `root` とします。BEMのような接頭辞や区切りは付けません。

準拠レベル：**必須**

**理由**

キャメルケースにすると、`styles.itemList` のように、JavaScriptのプロパティとしてそのまま書けます。ケバブケースでは `styles["item-list"]` と書く必要があり、エディタの補完も効きにくくなります。CSS Modulesではクラス名がファイルの中で閉じているため、ブロック名を付けて区別する必要はありません。

このルールは、Stylelintの `selector-class-pattern` で検出します。

**良い例**

```css title="OrderCard.module.css"
.root {
  padding: var(--space-md);
}

.title {
  font-size: var(--font-size-lg);
}

.itemList {
  display: grid;
  gap: var(--space-sm);
}
```

**悪い例**

```css title="OrderCard.module.css"
.order-card {
  padding: var(--space-md);
}

.order-card__title {
  font-size: var(--font-size-lg);
}

.item_list {
  display: grid;
  gap: var(--space-sm);
}
```

## Reactを使わない場合はBEMでクラス名を付ける

Reactを使わない場合は、BEMの形でクラス名を付けます。部品の名前（Block）、部品の中の要素（Element）、変化形（Modifier）を `block__element--modifier` の形でつなぎ、それぞれの名前はケバブケースにします。

準拠レベル：**必須**

**理由**

CSS Modulesを使わない場合、クラス名はページ全体で共有されます。BEMで部品の名前を必ず先頭に付けておけば、別の部品のスタイルと衝突せず、クラス名を見るだけでどの部品のスタイルかが分かります。

Elementの中のElementは作らず、`block__element__child` のようにつなげません。部品の構造が変わるたびにクラス名を変えることになるためです。

このルールは、Stylelintの `selector-class-pattern` で検出します。

**良い例**

```html
<article class="order-card order-card--highlighted">
  <h3 class="order-card__title">注文番号 1024</h3>
  <ul class="order-card__items">
    <li class="order-card__item">…</li>
  </ul>
</article>
```

**悪い例**

```html
<article class="orderCard highlighted">
  <h3 class="title">注文番号 1024</h3>
  <ul class="order-card__items">
    <li class="order-card__items__item">…</li>
  </ul>
</article>
```

## IDセレクタを使わない

スタイルを当てる要素は、クラスで選びます。IDセレクタは使いません。

準拠レベル：**必須**

**理由**

IDセレクタは詳細度が非常に高く、クラスで書いたスタイルでは上書きできません。上書きのためにさらに詳細度を上げることになり、スタイルの管理が難しくなります。`id` 属性は、ラベルやARIAとの関連付け、ページ内リンクのために使います。

このルールは、Stylelintの `selector-max-id` で検出します。

**良い例**

```css
.site-header {
  position: sticky;
  inset-block-start: 0;
}
```

**悪い例**

```css
#header {
  position: sticky;
  inset-block-start: 0;
}
```

## セレクタは短くし、詳細度を低く保つ

セレクタは、クラス1つで書くことを基本にします。要素名でクラスを修飾せず（`ul.list` のように書かない）、子孫セレクタは3段までにします。CSSのネストは2段までにします。

準拠レベル：**推奨**

**理由**

セレクタが長くなるほど、HTMLの構造に依存し、構造を少し変えただけでスタイルが外れます。詳細度も上がるため、変化形のスタイルで上書きしにくくなります。リセットや基本のスタイルのように、後から必ず上書きされるものは `:where()` で詳細度を0にします。

このルールは、Stylelintの `selector-no-qualifying-type`、`selector-max-compound-selectors`、`max-nesting-depth` で検出します。

**良い例**

```css
.order-card__title {
  font-weight: bold;
}

.order-card__link {
  color: var(--color-link);

  &:hover {
    text-decoration: none;
  }
}

:where(ul, ol) {
  padding-inline-start: 0;
}
```

**悪い例**

```css
.order-history .order-list article.order-card div h3 {
  font-weight: bold;
}

ul.order-card__links {
  & li {
    & a {
      &:hover {
        text-decoration: none;
      }
    }
  }
}
```

## !importantを使わない

`!important` は使いません。上書きできないときは、セレクタの詳細度や記述の順番を見直します。

準拠レベル：**必須**

**理由**

`!important` を付けたスタイルは、通常のスタイルでは上書きできなくなります。上書きするために別の場所にも `!important` を付けることになり、どのスタイルが効いているのかを追えなくなります。

このルールは、Stylelintの `declaration-no-important` で検出します。

**良い例**

```css
.button {
  background-color: var(--color-primary);
}

.button--danger {
  background-color: var(--color-danger);
}
```

**悪い例**

```css
.button {
  background-color: var(--color-primary) !important;
}

.button--danger {
  background-color: var(--color-danger) !important;
}
```

## 状態は属性と疑似クラスで表す

開閉、選択、無効などの状態は、HTMLの属性やARIAの属性、疑似クラスで表せる場合は、それをセレクタに使います。表せない状態だけを、Modifier（CSS Modulesでは別のクラス）で表します。

準拠レベル：**推奨**

**理由**

状態を表すクラス（`.is-open` など）を別に付けると、`aria-expanded` 属性などの値と、クラスの付け外しを両方そろえる必要があり、片方だけ変えてしまう誤りが起きます。属性をセレクタに使えば、支援技術に伝わる状態と見た目が必ず一致します。

**良い例**

```css
.menu-button[aria-expanded="true"] {
  background-color: var(--color-selected);
}

.tab[aria-selected="true"] {
  border-block-end-color: var(--color-primary);
}

.button:disabled {
  opacity: 0.5;
}
```

**悪い例**

```css
.menu-button.is-open {
  background-color: var(--color-selected);
}

.tab.is-active {
  border-block-end-color: var(--color-primary);
}

.button.is-disabled {
  opacity: 0.5;
}
```

## 色や余白などの値はカスタムプロパティにまとめる

色、余白、文字サイズ、角の丸み、`z-index` など、デザインで決まった値は、`:root` にカスタムプロパティとして定義し、`var()` で参照します。

準拠レベル：**推奨**

**理由**

同じ値をあちこちに直接書くと、デザインの変更のたびにすべてを探して書き換えることになり、漏れが出ます。カスタムプロパティにまとめておけば、1か所の変更で全体に反映でき、ダークモードのように値を切り替えるのも簡単です。`z-index` も一覧にしておくと、重なり順の衝突を避けられます。

**良い例**

```css
:root {
  --color-primary: #0050c8;
  --color-text: #1a1a1a;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --z-index-header: 100;
  --z-index-dialog: 200;
}

.order-card {
  padding: var(--space-md);
  color: var(--color-text);
}
```

**悪い例**

```css
.order-card {
  padding: 16px;
  color: #1a1a1a;
}

.site-header {
  z-index: 9999;
}
```

## 方向を表すプロパティには論理プロパティを使う

余白、位置、大きさを指定するときは、`margin-inline`、`padding-block`、`inset-inline-start`、`inline-size` などの論理プロパティを使います。

準拠レベル：**推奨**

**理由**

論理プロパティは、上下左右ではなく、文章の流れる方向を基準に指定します。縦書きや、右から左へ書く言語に切り替えても、レイアウトがそのまま正しく働きます。上下左右を基準にしたプロパティと混ぜて書くと、どちらの考え方で指定したのかが読み取りにくくなるため、論理プロパティにそろえます。

**良い例**

```css
.order-card {
  margin-block-end: var(--space-md);
  padding-inline: var(--space-md);
  max-inline-size: 40rem;
}
```

**悪い例**

```css
.order-card {
  margin-bottom: var(--space-md);
  padding-left: var(--space-md);
  padding-right: var(--space-md);
  max-width: 40rem;
}
```

## レイアウトはFlexboxとGridで組む

要素を並べるレイアウトは、FlexboxかGridで組みます。`float` や、`position: absolute` での配置で並べません。要素の間隔は `gap` で作ります。

準拠レベル：**推奨**

**理由**

`float` は本来、文章の中に画像を回り込ませるためのものです。レイアウトに使うと、回り込みの解除などの余計な記述が必要になります。`position: absolute` で配置した要素は、内容の量が変わると重なります。Flexbox、Gridと `gap` を使えば、内容の量や画面の幅が変わっても崩れにくいレイアウトを、短い記述で作れます。

**良い例**

```css
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--space-md);
}
```

**悪い例**

```css
.product-list__item {
  float: left;
  width: 33.333%;
  margin-right: 16px;
}

.product-list__item:nth-child(3n) {
  margin-right: 0;
}
```

## メディアクエリは狭い画面を基準にし、範囲の構文で書く

スタイルは狭い画面向けを基準に書き、広い画面向けの違いをメディアクエリで加えます。メディアクエリは、`min-width` ではなく `(width >= 48rem)` のような範囲の構文で書きます。部品の置き場所によって形を変える場合は、コンテナクエリを使います。

準拠レベル：**推奨**

**理由**

狭い画面では要素を縦に並べるだけのことが多く、基準にしたほうが記述が少なく済みます。範囲の構文は、`min-width` と `max-width` の境目の値がどちらに含まれるかを、不等号で読み取れます。コンテナクエリを使えば、同じ部品を広い本文にも狭いサイドバーにも置けます。

範囲の構文で書くことは、Stylelintの `media-feature-range-notation` で検出します。このルールは `stylelint-config-standard` に含まれています。

**良い例**

```css
.order-history {
  display: grid;
  gap: var(--space-md);
}

@media (width >= 48rem) {
  .order-history {
    grid-template-columns: 16rem 1fr;
  }
}
```

**悪い例**

```css
.order-history {
  display: grid;
  grid-template-columns: 16rem 1fr;
}

@media (max-width: 767px) {
  .order-history {
    grid-template-columns: 1fr;
  }
}
```

## line-heightには単位を付けない

`line-height` は、`1.6` のように単位を付けない数値で指定します。

準拠レベル：**推奨**

**理由**

単位を付けた `line-height` は、親要素で計算した値がそのまま子要素に引き継がれます。子要素の文字サイズが大きいと、行の高さが足りずに行が重なります。単位を付けない数値なら、それぞれの要素の文字サイズに対する倍率として計算されます。

**良い例**

```css
body {
  line-height: 1.6;
}
```

**悪い例**

```css
body {
  font-size: 1rem;
  line-height: 1.6rem;
}
```

## ベンダープレフィックスを手で書かない

`-webkit-` などのベンダープレフィックスは手で書きません。必要なプレフィックスは、ビルドツール（Lightning CSSやAutoprefixerなど）で、[対応ブラウザ](/coding-guidelines/about/browser-support/)に合わせて自動的に付けます。

準拠レベル：**推奨**

**理由**

どのプロパティにプレフィックスが必要かは、対応ブラウザによって変わり、ブラウザの更新とともに不要になっていきます。手で書くと、不要になったプレフィックスが残り続けたり、必要なものが漏れたりします。

このルールは、Stylelintの `property-no-vendor-prefix` などで検出します。これらのルールは `stylelint-config-standard` に含まれています。

**良い例**

```css
.title {
  user-select: none;
}
```

**悪い例**

```css
.title {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
```

## プロパティの並び順をそろえる

1つのルールの中のプロパティを、決まった順番で並べます。採用する場合は、`stylelint-config-recess-order` の順番（位置、ボックス、文字、見た目の順）を使い、並べ替えはStylelintの自動修正に任せます。

準拠レベル：**任意**

**理由**

並び順がそろっていると、あるプロパティが指定されているかを、決まった場所を見るだけで確かめられます。ただし、並び順がばらばらでも表示は変わらないため、採用するかはプロジェクトごとに決めます。

**良い例**

```json title=".stylelintrc.json"
{
  "extends": ["stylelint-config-standard", "stylelint-config-recess-order"]
}
```

```css
.order-card {
  position: relative;
  display: grid;
  padding: var(--space-md);
  font-size: var(--font-size-md);
  color: var(--color-text);
  background-color: var(--color-surface);
}
```

**悪い例**

```css
.order-card {
  color: var(--color-text);
  padding: var(--space-md);
  position: relative;
  background-color: var(--color-surface);
  display: grid;
  font-size: var(--font-size-md);
}
```
