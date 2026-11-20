---
title: パフォーマンス
description: 表示と操作の速さを保つためのルール。Webフォント、依存パッケージとJavaScriptの量、外部のスクリプト、レイアウトのずれ、重い処理の扱いを決めます。
---

表示と操作の速さを保つためのルールを決めます。

速さに関わるルールのうち、画像の形式と読み込み方は[画像](/coding-guidelines/common/images/)、Reactの描画の最適化と遅延読み込みは[React](/coding-guidelines/tech/react/#パフォーマンス)、速さの計測の方法と目標は[検証](/coding-guidelines/quality/verification/#表示の速さはlighthouseで計測しcore-web-vitalsの良好を目指す)のページで扱います。

## 速さのための変更は、計測してから行う

速さを理由にコードを変えるときは、変更の前後で計測し、効果があることを確かめます。計測で問題が見つかっていない箇所を、推測で最適化しません。

準拠レベル：**推奨**

**理由**

遅い原因は、推測とは別の場所にあることがほとんどです。計測せずに最適化すると、効果のない変更でコードだけが複雑になります。計測には、Lighthouseや、ブラウザの開発者ツールのパフォーマンスパネルを使います。

**良い例**

```md
<!-- プルリクエストの説明 -->
## 確認したこと
- 商品一覧の初回表示のLCP：3.8秒 → 2.1秒（Lighthouse、モバイルの設定、3回の中央値）
```

**悪い例**

```md
<!-- プルリクエストの説明 -->
## 変更内容
- 遅そうなので、一覧の処理をすべてメモ化した
```

## 本文の日本語にはシステムフォントを使う

日本語の本文には、Webフォントを使わず、端末に入っているフォント（システムフォント）を指定します。Webフォントは、見出しやロゴなど、デザイン上どうしても必要な箇所にだけ使います。

準拠レベル：**推奨**

**理由**

日本語のフォントは文字の数が多いため、ファイルが数MBになることもあり、読み込みが終わるまで文字が表示されなかったり、表示の途中で書体が切り替わってレイアウトがずれたりします。システムフォントなら、読み込みの時間はかかりません。

**良い例**

```css
:root {
  --font-family-base: system-ui, sans-serif;
}

body {
  font-family: var(--font-family-base);
}
```

**悪い例**

```css
/* 本文全体に、日本語のWebフォントを読み込んで使っている */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap");

body {
  font-family: "Noto Sans JP", sans-serif;
}
```

## Webフォントは使う文字と太さに絞り、WOFF2で自分で配信する

Webフォントを使うときは、使う文字（サブセット）と太さだけに絞ったファイルを、WOFF2の形式で、サイトと同じサーバーから配信します。`@font-face` には `font-display: swap` を指定します。

準拠レベル：**推奨**

**理由**

使わない文字や太さを含むフォントは、読み込みを遅くするだけです。WOFF2は、ほかの形式より圧縮率が高く、[対応ブラウザ](/coding-guidelines/about/environment/)のすべてで使えます。外部のサーバーから読み込むと、そのサーバーへの接続に時間がかかり、外部のサービスにアクセスの情報も渡ります。

`font-display: swap` を指定すると、フォントの読み込み中もシステムフォントで文字が表示されるため、文字が見えない時間がなくなります。

**良い例**

```css
@font-face {
  font-family: "Brand";
  src: url("/fonts/brand-bold-subset.woff2") format("woff2");
  font-weight: 700;
  font-display: swap;
}
```

**悪い例**

```css
@font-face {
  font-family: "Brand";
  /* 全文字、全太さを含むファイルを、圧縮率の低い形式で読み込んでいる */
  src: url("https://fonts.example.com/brand-all.ttf");
}
```

## 依存パッケージは、追加する前にサイズを確かめる

ブラウザで動くコードに依存パッケージを追加するときは、追加によってバンドルがどれだけ大きくなるかを確かめます。標準の機能や、すでに使っているパッケージでできることのために、大きなパッケージを追加しません。

準拠レベル：**推奨**

**理由**

依存パッケージのコードは、ブラウザに送るJavaScriptにそのまま加わります。JavaScriptが大きくなるほど、ダウンロードと解析に時間がかかり、ページを操作できるようになるまでが遅くなります。日付の整形や配列の操作などは、標準の `Intl` や配列のメソッドでできることが多くあります。

**良い例**

```ts
// 標準の機能で日付を整形する
const label = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(date);
```

**悪い例**

```ts
// 日付の整形1か所のために、大きなライブラリを追加している
import moment from "moment";

const label = moment(date).format("YYYY年M月D日");
```

## ライブラリは使う機能だけをimportする

ライブラリは、使う関数やコンポーネントだけを名前付きでimportします。ライブラリ全体を読み込む書き方はしません。

準拠レベル：**推奨**

**理由**

ビルドツールは、使われていないコードを取り除きます（ツリーシェイキング）。しかし、ライブラリ全体を1つのオブジェクトとして読み込むと、どの機能を使っているかを判断できず、すべてのコードがバンドルに残ります。

**良い例**

```ts
import { debounce } from "es-toolkit";
```

**悪い例**

```ts
// ライブラリ全体がバンドルに含まれる
import _ from "lodash";

const handleInput = _.debounce(search, 300);
```

## 外部のスクリプトは必要なものに絞る

アクセス解析、広告、チャットなどの外部のスクリプトは、目的がはっきりしていて、効果を確かめているものだけを読み込みます。使わなくなったスクリプトは削除します。

準拠レベル：**推奨**

**理由**

外部のスクリプトは、自分で中身を管理できず、大きさや実行にかかる時間も変わります。1つずつは小さく見えても、数が増えると、表示と操作の遅さの大きな原因になります。

**良い例**

```html
<!-- 目的を確かめた解析のスクリプトだけを、遅らせて読み込む -->
<script src="https://analytics.example.com/script.js" defer></script>
```

**悪い例**

```html
<!-- 試しに入れたまま使っていないツールが残っている -->
<script src="https://analytics.example.com/script.js"></script>
<script src="https://heatmap.example.com/tag.js"></script>
<script src="https://ab-test.example.com/loader.js"></script>
<script src="https://chat.example.com/widget.js"></script>
```

## 後から表示する要素は、場所を先に確保する

読み込みの後に表示する要素（広告、埋め込み、通知のバナー、データを取得してから出す部分など）は、表示する前から同じ大きさの場所を確保しておきます。

準拠レベル：**推奨**

**理由**

後から要素が差し込まれると、その下の内容が押し下げられ、読んでいた位置がずれたり、押そうとしたボタンが動いて別のものを押したりします。このずれは、Core Web VitalsのCLSとして計測されます。画像のずれを防ぐ方法は[画像](/coding-guidelines/common/images/#img要素にはwidthとheightを書く)のページを参照してください。

**良い例**

```css
.adSlot {
  min-block-size: 250px;
}

.videoEmbed {
  aspect-ratio: 16 / 9;
}
```

```tsx
// 読み込み中も、表示後と同じ大きさのスケルトンを出す
if (isPending) {
  return <OrderSummarySkeleton />;
}
```

**悪い例**

```tsx
// 読み込み中は何も描画せず、取得後に急に要素が現れる
if (isPending) {
  return null;
}
```

## 時間のかかる処理で、操作への反応を止めない

1回の処理に50ミリ秒以上かかる処理は、操作への反応を止めないように、分割する、実行の回数を減らす、Web Workerに移す、のいずれかで対処します。入力のたびに重い処理を行う場合は、入力が止まるまで待ってから実行します。

準拠レベル：**推奨**

**理由**

ブラウザは、JavaScriptを実行している間、クリックや入力に反応できません。50ミリ秒を超える処理（ロングタスク）が続くと、操作してから画面が変わるまでが遅く感じられます。この遅さは、Core Web VitalsのINPとして計測されます。

**良い例**

```ts
import { debounce } from "es-toolkit";

// 入力が300ミリ秒止まってから絞り込む
const handleInput = debounce((keyword: string) => {
  setResults(filterProducts(products, keyword));
}, 300);
```

**悪い例**

```ts
// 1文字入力するたびに、数万件を絞り込む
function handleInput(keyword: string) {
  setResults(filterProducts(products, keyword));
}
```

## 要素が画面に入ったかはIntersectionObserverで調べる

要素が画面に入ったか（スクロールで表示されたら読み込む、アニメーションを始めるなど）を調べるときは、`IntersectionObserver` を使います。`scroll` イベントの中で要素の位置を計算しません。

準拠レベル：**推奨**

**理由**

`scroll` イベントは、スクロールの間に何度も発生します。その中で `getBoundingClientRect()` などで位置を読むと、そのたびにブラウザがレイアウトを計算し直し、スクロールが引っかかるようになります。`IntersectionObserver` は、ブラウザが効率よく判定し、変化したときだけ知らせます。

**良い例**

```ts
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      loadComments();
      observer.disconnect();
    }
  }
});

observer.observe(commentsSection);
```

**悪い例**

```ts
window.addEventListener("scroll", () => {
  const rect = commentsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    loadComments();
  }
});
```
