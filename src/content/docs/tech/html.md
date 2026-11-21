---
title: HTML
description: HTMLの書き方。ページのメタデータ、仕様に沿った要素と属性の使い方、フォームの作り方を決めます。
---

HTMLの書き方を決めます。JSXでマークアップを書く場合も、このページのルールに従います。

要素の選び方、ARIA、ページのタイトル、見出し、フォームのラベルなど、アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/quality/accessibility/)のページで扱います。画像の扱いは[画像](/coding-guidelines/common/images/)のページを参照してください。

多くのルールは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めたMarkuplintの設定で検出します。

## ページごとに内容を表すdescriptionを書く

公開するページには、`<meta name="description" />` で、そのページの内容を1〜2文で説明する文を書きます。すべてのページに同じ文を使いません。

準拠レベル：**推奨**

**理由**

`description` は、検索結果やSNSでの共有のときに、ページの説明として表示されることがあります。ページごとに内容を表す文にしておけば、検索した人が、開く前にそのページが目的に合うかを判断できます。全ページで同じ文を使うと、どのページも同じに見え、説明の役に立ちません。

ページのタイトルの付け方は、[アクセシビリティ](/coding-guidelines/quality/accessibility/#ページごとに内容を表すタイトルを付ける)のページを参照してください。

**良い例**

```html
<title>送料と配送日数 | Example Store</title>
<meta name="description" content="地域ごとの送料と、注文から届くまでの日数の目安をまとめています。" />
```

**悪い例**

```html
<title>送料と配送日数 | Example Store</title>
<!-- サイト全体の紹介文を、すべてのページで使い回している -->
<meta name="description" content="Example Storeは、暮らしの道具を扱うオンラインストアです。" />
```

## 検索エンジンに載せないページにはnoindexを指定する

検証用の環境、ログイン後の画面、検索結果のページなど、検索エンジンに載せないページには、`<meta name="robots" content="noindex" />` を指定します。

準拠レベル：**必須**

**理由**

指定しないと、公開前の検証用の環境や、利用者ごとの画面が検索結果に出ることがあります。一度検索結果に出ると、消えるまでに時間がかかります。`robots.txt` でクロールを禁止するだけでは、ほかのページからリンクされたURLが検索結果に載ることがあるため、`noindex` で指定します。

**良い例**

```html
<!-- 検証用の環境では、すべてのページに出力する -->
<meta name="robots" content="noindex" />
```

**悪い例**

```text
# robots.txt でクロールを禁止しただけで、noindex を指定していない
User-agent: *
Disallow: /
```

## SNSで共有されるページにはOGPを指定する

SNSで共有されることがあるページには、OGP（`og:title`、`og:description`、`og:image`、`og:url`、`og:type`）と、`twitter:card` を指定します。`og:image` は絶対URLで指定し、画像は1200×630pxで用意します。

準拠レベル：**推奨**

**理由**

OGPがないと、共有したときに、タイトルや画像がSNSの側で推測して表示され、意図しない画像が出たり、何も表示されなかったりします。`og:image` を相対URLで書くと、SNSが画像を取得できません。1200×630pxは、主なSNSで切れずに表示される大きさです。

**良い例**

```html
<meta property="og:title" content="送料と配送日数 | Example Store" />
<meta property="og:description" content="地域ごとの送料と、注文から届くまでの日数の目安をまとめています。" />
<meta property="og:image" content="https://example.com/images/ogp-shipping.png" />
<meta property="og:url" content="https://example.com/shipping/" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

**悪い例**

```html
<meta property="og:title" content="送料と配送日数 | Example Store" />
<!-- 画像を相対URLで指定し、og:url などが足りない -->
<meta property="og:image" content="/images/ogp-shipping.png" />
```

## 仕様で許された入れ子と属性だけを使う

要素の中に入れてよい要素と、要素に付けてよい属性は、HTMLの仕様（[HTML Living Standard](https://html.spec.whatwg.org/)）に従います。

準拠レベル：**必須**

**理由**

仕様に反したHTMLは、ブラウザが独自に補正して表示します。補正のしかたはブラウザによって異なるため、見た目や動作がずれたり、支援技術に構造が正しく伝わらなかったりします。`p` 要素の中に `div` 要素を入れる、`a` 要素の中に `button` 要素を入れる、といった誤りは、見た目では気づけません。

**良い例**

```html
<div class="notice">
  <p>営業日は平日のみです。</p>
</div>

<a href="/orders/1024/">注文番号 1024 の詳細</a>
```

**悪い例**

```html
<p class="notice">
  <div>営業日は平日のみです。</div>
</p>

<a href="/orders/1024/"><button type="button">注文番号 1024 の詳細</button></a>
```

## idをページの中で重複させない

`id` 属性の値は、1つのページの中で重複させません。`for`、`aria-labelledby` などで `id` を参照するときは、ページに存在する `id` を参照します。

準拠レベル：**必須**

**理由**

`id` が重複すると、`label` の `for` 属性や `aria-describedby` 属性が、意図しない要素を指します。JavaScriptの `getElementById()` も、最初に見つかった要素しか返しません。同じ部品を1ページに複数置く場合は、Reactの `useId()` などで `id` を部品ごとに作ります。

**良い例**

```html
<label for="shipping-zip">配送先の郵便番号</label>
<input id="shipping-zip" type="text" inputmode="numeric" />

<label for="billing-zip">請求先の郵便番号</label>
<input id="billing-zip" type="text" inputmode="numeric" />
```

**悪い例**

```html
<label for="zip">配送先の郵便番号</label>
<input id="zip" type="text" inputmode="numeric" />

<label for="zip">請求先の郵便番号</label>
<input id="zip" type="text" inputmode="numeric" />
```

## section要素は見出しのあるまとまりにだけ使う

`section` 要素は、見出しを付けられる内容のまとまりにだけ使います。スタイルを当てるためだけに要素で囲むときは `div` 要素を使います。

準拠レベル：**推奨**

**理由**

`section` 要素は「文書の中の1つの節」を表します。見出しのない `section` は、どの節なのかを説明できず、文書の構造をかえって分かりにくくします。見た目のための入れ物には、意味を持たない `div` 要素が適しています。

**良い例**

```html
<section aria-labelledby="history-title">
  <h2 id="history-title">注文履歴</h2>
  <div class="orderList">…</div>
</section>
```

**悪い例**

```html
<section class="wrapper">
  <section class="orderList">…</section>
</section>
```

## button要素にはtype属性を書く

`button` 要素には、必ず `type` 属性を書きます。フォームを送信するボタンは `type="submit"`、それ以外は `type="button"` にします。

準拠レベル：**必須**

**理由**

`type` 属性を省略した `button` 要素は、送信ボタン（`type="submit"`）として扱われます。フォームの中に置いた「戻る」や「行を追加」のボタンを押すと、意図せずフォームが送信されてしまいます。

**良い例**

```html
<form action="/orders/" method="post">
  <button type="button">行を追加</button>
  <button type="submit">注文する</button>
</form>
```

**悪い例**

```html
<form action="/orders/" method="post">
  <button>行を追加</button>
  <button>注文する</button>
</form>
```

## 送信を伴う入力はform要素で囲む

入力した内容を送信する部品は、`form` 要素で囲みます。送信の処理は、ボタンの `click` イベントではなく、`form` 要素の `submit` イベントで受け取ります。

準拠レベル：**推奨**

**理由**

`form` 要素で囲むと、入力欄でEnterキーを押したときの送信や、`required` 属性などによるブラウザの入力チェックが標準で働きます。ボタンの `click` イベントだけで送信すると、これらを自分で実装し直すことになります。

**良い例**

```html
<form id="search-form">
  <label for="keyword">キーワード</label>
  <input id="keyword" type="search" name="keyword" required />
  <button type="submit">検索</button>
</form>

<script type="module">
  document.querySelector('#search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    search(new FormData(event.currentTarget));
  });
</script>
```

**悪い例**

```html
<div class="search">
  <label for="keyword">キーワード</label>
  <input id="keyword" type="text" />
  <button type="button" id="search-button">検索</button>
</div>

<script type="module">
  document.querySelector('#search-button').addEventListener('click', () => {
    search(document.querySelector('#keyword').value);
  });
</script>
```

## 入力欄には内容に合ったtypeを指定する

`input` 要素の `type` 属性は、入力する内容に合わせて `email`、`tel`、`url`、`number`、`date`、`search` などから選びます。数字だけを入力するが計算には使わない値（郵便番号やカード番号など）は、`type="text"` と `inputmode="numeric"` を組み合わせます。

準拠レベル：**推奨**

**理由**

`type` に合わせて、スマートフォンでは入力しやすいキーボードが表示され、ブラウザによる入力チェックも働きます。`type="number"` は、先頭の0が消える、マウスのホイールで値が変わるなど、計算に使わない数字には向かない動作をするため、郵便番号などには使いません。

**良い例**

```html
<input id="email" type="email" name="email" />
<input id="tel" type="tel" name="tel" />
<input id="quantity" type="number" name="quantity" min="1" max="99" />
<input id="zip" type="text" name="zip" inputmode="numeric" />
```

**悪い例**

```html
<input id="email" type="text" name="email" />
<input id="tel" type="text" name="tel" />
<input id="zip" type="number" name="zip" />
```

## style属性でスタイルを書かない

スタイルはCSSファイルに書き、`style` 属性には書きません。JavaScriptで計算した値を渡す場合だけ、`style` 属性でカスタムプロパティを設定します。

準拠レベル：**推奨**

**理由**

`style` 属性に書いたスタイルは、CSSファイルからは見えず、詳細度も高いため、ほかのスタイルで上書きしにくくなります。メディアクエリや `:hover` などの状態も書けません。値だけをカスタムプロパティで渡せば、スタイルの書き方はCSSファイルにまとめたまま、動的な値を使えます。

**良い例**

```html
<div class="progress" style="--progress: 40%">…</div>
```

```css
.progress {
  inline-size: var(--progress);
  background-color: var(--color-primary);
}
```

**悪い例**

```html
<div style="width: 40%; background-color: #0055cc; margin-top: 16px">…</div>
```
