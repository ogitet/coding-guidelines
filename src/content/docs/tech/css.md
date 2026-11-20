---
title: CSS
description: CSSの書き方。スタイルの置き方とクラス名の付け方、カスケードレイヤー、セレクタと詳細度、値の管理、レスポンシブの書き方を決めます。
---

CSSの書き方を決めます。クラス名の付け方もこのページで扱います。

フォーカスの表示、コントラスト比、文字サイズの単位、動きを減らす設定など、アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/quality/accessibility/)のページで扱います。

多くのルールは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めたStylelintの設定で検出します。

## Reactではスタイルをコンポーネントごとに閉じ込める

Reactで作る場合は、CSS Modulesを使い、コンポーネントごとにCSSファイルを分けます。CSSファイルはコンポーネントと同じディレクトリに置き、名前はコンポーネントと同じにして `.module.css` を付けます。変数や要素そのものの見た目など、全体にかかるスタイルだけを `global.css` に書きます。

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
import styles from './OrderCard.module.css';

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
import '../../styles/global.css';

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="card">
      <h3 className="title">注文番号 {order.id}</h3>
    </article>
  );
}
```

## クラス名はキャメルケースのBEMで付ける

クラス名は、キャメルケースのBEM（`blockName__elementName--modifierName`）の形で付けます。CSS Modulesでは、クラス名がファイルの中で閉じているため、Blockを省いて `root`、`title`、`itemList` のように付けます。コンポーネントの一番外側の要素は `root` とします。

準拠レベル：**必須**

**理由**

キャメルケースにすると、`styles.itemList` のように、JavaScriptのプロパティとしてそのまま書けます。`global.css` のようにクラス名がページ全体で共有される場所では、Blockの名前を先頭に付けておけば、別の部品のスタイルと衝突せず、クラス名を見るだけでどの部品のスタイルかが分かります。

**良い例**

```css title="OrderCard.module.css"
.root {
  padding: var(--space-md);
}

.itemList {
  display: grid;
}
```

```css title="global.css"
.siteHeader__nav--compact {
  gap: var(--space-sm);
}
```

**悪い例**

```css title="OrderCard.module.css"
.order-card {
  padding: var(--space-md);
}

.item_list {
  display: grid;
}
```

```css title="global.css"
.site-header__nav--compact {
  gap: var(--space-sm);
}
```

## スタイルはカスケードレイヤーに入れる

すべてのスタイルを、`reset`、`base`、`components`、`utilities` のいずれかのカスケードレイヤーに入れます。レイヤーの順は `global.css` の冒頭で宣言し、コンポーネントのスタイルは `components` に入れます。

準拠レベル：**必須**

**理由**

カスケードレイヤーは、詳細度より先にレイヤーの順で優先が決まります。後ろのレイヤーのスタイルが必ず勝つため、上書きのために詳細度を上げる必要がなくなります。レイヤーの外に書いたスタイルはどのレイヤーにも勝ってしまうため、必ずどれかに入れます。

**良い例**

```css title="global.css"
@layer reset, base, components, utilities;
```

```css title="OrderCard.module.css"
@layer components {
  .root {
    padding: var(--space-md);
  }
}
```

**悪い例**

```css title="OrderCard.module.css"
/* レイヤーの外に書いている */
.root {
  padding: var(--space-md);
}
```

## IDセレクタと!importantを使わない

スタイルを当てる要素は、クラスで選びます。IDセレクタと `!important` は使いません。上書きできないときは、レイヤーやセレクタの詳細度を見直します。

準拠レベル：**必須**

**理由**

IDセレクタは詳細度が非常に高く、`!important` を付けたスタイルは通常のスタイルで上書きできません。上書きするためにさらに詳細度を上げたり、別の場所にも `!important` を付けたりすることになり、どのスタイルが効いているのかを追えなくなります。`id` 属性は、ラベルやARIAとの関連付け、ページ内リンクのために使います。

**良い例**

```css
.siteHeader {
  position: sticky;
}

.button--danger {
  background-color: var(--color-danger);
}
```

**悪い例**

```css
#header {
  position: sticky;
}

.button--danger {
  background-color: var(--color-danger) !important;
}
```

## セレクタは短くし、詳細度を低く保つ

セレクタは、クラス1つで書くことを基本にします。要素名でクラスを修飾せず（`ul.list` のように書かない）、子孫セレクタは3段までにします。CSSのネストは2段までにします。

準拠レベル：**推奨**

**理由**

セレクタが長くなるほど、HTMLの構造に依存し、構造を少し変えただけでスタイルが外れます。詳細度も上がるため、変化形のスタイルで上書きしにくくなります。

**良い例**

```css
.orderCard__title {
  font-weight: bold;
}

.orderCard__link {
  color: var(--color-link);

  &:hover {
    text-decoration: none;
  }
}
```

**悪い例**

```css
.orderHistory .orderList article.orderCard div h3 {
  font-weight: bold;
}

ul.orderCard__links {
  & li {
    & a {
      &:hover {
        text-decoration: none;
      }
    }
  }
}
```

## 状態は属性と疑似クラスで表す

開閉、選択、無効などの状態は、HTMLの属性やARIAの属性、疑似クラスで表せる場合は、それをセレクタに使います。表せない状態だけを、Modifier（CSS Modulesでは別のクラス）で表します。

準拠レベル：**推奨**

**理由**

状態を表すクラス（`.is-open` など）を別に付けると、`aria-expanded` 属性などの値と、クラスの付け外しを両方そろえる必要があり、片方だけ変えてしまう誤りが起きます。属性をセレクタに使えば、支援技術に伝わる状態と見た目が必ず一致します。

**良い例**

```css
.menuButton[aria-expanded="true"] {
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
.menuButton.is-open {
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

.orderCard {
  padding: var(--space-md);
  color: var(--color-text);
}
```

**悪い例**

```css
.orderCard {
  padding: 16px;
  color: #1a1a1a;
}

.siteHeader {
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
.orderCard {
  margin-block-end: var(--space-md);
  padding-inline: var(--space-md);
  max-inline-size: 40rem;
}
```

**悪い例**

```css
.orderCard {
  margin-bottom: var(--space-md);
  padding-left: var(--space-md);
  padding-right: var(--space-md);
  max-width: 40rem;
}
```

## メディアクエリは狭い画面を基準にし、範囲の構文で書く

スタイルは狭い画面向けを基準に書き、広い画面向けの違いをメディアクエリで加えます。メディアクエリは、`min-width` ではなく `(width >= 48rem)` のような範囲の構文で書きます。部品の置き場所によって形を変える場合は、コンテナクエリを使います。

準拠レベル：**推奨**

**理由**

狭い画面では要素を縦に並べるだけのことが多く、基準にしたほうが記述が少なく済みます。範囲の構文は、`min-width` と `max-width` の境目の値がどちらに含まれるかを、不等号で読み取れます。コンテナクエリを使えば、同じ部品を広い本文にも狭いサイドバーにも置けます。

**良い例**

```css
.orderHistory {
  display: grid;
  gap: var(--space-md);
}

@media (width >= 48rem) {
  .orderHistory {
    grid-template-columns: 16rem 1fr;
  }
}
```

**悪い例**

```css
.orderHistory {
  display: grid;
  grid-template-columns: 16rem 1fr;
}

@media (max-width: 767px) {
  .orderHistory {
    grid-template-columns: 1fr;
  }
}
```
