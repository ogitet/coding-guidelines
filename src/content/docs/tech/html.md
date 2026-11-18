---
title: HTML
description: HTMLの書き方。文書の基本構造、仕様に沿った要素と属性の使い方、フォームとスクリプトの読み込み方を決めます。
---

HTMLの書き方を決めます。JSXでマークアップを書く場合も、このページのルールに従います。

要素の選び方、ARIA、`lang` 属性、ページのタイトル、見出し、フォームのラベルなど、アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/common/accessibility/)のページで扱います。画像の扱いは[画像](/coding-guidelines/common/images/)のページを参照してください。

このページのルールのうち、Markuplintで検出できるものは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めた設定に次の内容を加えて有効にします。

```json title=".markuplintrc（追加分）"
{
  "rules": {
    "end-tag": true
  },
  "nodeRules": [
    {
      "selector": "button",
      "rules": { "required-attr": "type" }
    }
  ]
}
```

## 文書型宣言を書く

HTMLファイルの1行目に `<!doctype html>` を書きます。

準拠レベル：**必須**

**理由**

文書型宣言がないと、ブラウザは古いWebページとの互換を優先する表示方法（互換モード）でページを表示します。互換モードでは、ボックスの大きさの計算などがCSSの仕様と異なり、ブラウザによって表示が崩れます。

このルールは、Markuplintの `doctype` で検出します。

**良い例**

```html
<!doctype html>
<html lang="ja">
  …
</html>
```

**悪い例**

```html
<html lang="ja">
  …
</html>
```

## 文字コードはUTF-8にし、headの先頭で宣言する

ファイルの文字コードはUTF-8にします。`head` 要素の最初の子要素として `<meta charset="utf-8" />` を書きます。

準拠レベル：**必須**

**理由**

文字コードの宣言がないと、ブラウザが文字コードを推測し、日本語が文字化けすることがあります。ブラウザはファイルの先頭の1024バイトまでで文字コードを判断するため、`title` 要素などより前に書きます。

`meta` 要素がないことは、Markuplintの `required-element` で検出します。

**良い例**

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>注文履歴 | Order Manager</title>
</head>
```

**悪い例**

```html
<head>
  <title>注文履歴 | Order Manager</title>
  <link rel="stylesheet" href="/styles/main.css" />
  <meta charset="shift_jis" />
</head>
```

## viewportを指定する

`head` 要素に `<meta name="viewport" content="width=device-width, initial-scale=1" />` を書きます。

準拠レベル：**必須**

**理由**

`viewport` の指定がないと、スマートフォンのブラウザは、パソコン向けの幅でページを描いてから縮小して表示します。文字が小さくなり、メディアクエリも意図した幅で切り替わりません。

拡大を禁止する指定（`user-scalable=no` など）を加えないことは、[アクセシビリティ](/coding-guidelines/common/accessibility/#ブラウザの拡大と文字サイズの設定を妨げない)のページで決めています。

**良い例**

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**悪い例**

```html
<!-- viewport の指定がない -->
<head>
  <meta charset="utf-8" />
  <title>注文履歴 | Order Manager</title>
</head>
```

## 仕様で許された入れ子と属性だけを使う

要素の中に入れてよい要素と、要素に付けてよい属性は、HTMLの仕様（[HTML Living Standard](https://html.spec.whatwg.org/)）に従います。

準拠レベル：**必須**

**理由**

仕様に反したHTMLは、ブラウザが独自に補正して表示します。補正のしかたはブラウザによって異なるため、見た目や動作がずれたり、支援技術に構造が正しく伝わらなかったりします。`p` 要素の中に `div` 要素を入れる、`a` 要素の中に `button` 要素を入れる、といった誤りは、見た目では気づけません。

このルールは、Markuplintの `permitted-contents` と `invalid-attr` で検出します。

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

## 廃止された要素と属性を使わない

`font`、`center`、`marquee` などの廃止された要素と、`align`、`bgcolor`、`border` などの廃止された属性は使いません。見た目はCSSで指定します。

準拠レベル：**必須**

**理由**

廃止された要素や属性は、ブラウザが互換のために残しているだけで、今後の動作は保証されません。見た目をHTMLに書くと、CSSと二か所で見た目を管理することになり、変更の漏れが起きます。

このルールは、Markuplintの `deprecated-element` と `deprecated-attr` で検出します。

**良い例**

```html
<p class="lead">年末年始の配送について</p>
<table class="order-table">…</table>
```

**悪い例**

```html
<center><font color="red">年末年始の配送について</font></center>
<table border="1" align="center">…</table>
```

## idをページの中で重複させない

`id` 属性の値は、1つのページの中で重複させません。`for`、`aria-labelledby` などで `id` を参照するときは、ページに存在する `id` を参照します。

準拠レベル：**必須**

**理由**

`id` が重複すると、`label` の `for` 属性や `aria-describedby` 属性が、意図しない要素を指します。JavaScriptの `getElementById()` も、最初に見つかった要素しか返しません。同じ部品を1ページに複数置く場合は、Reactの `useId()` などで `id` を部品ごとに作ります。

このルールは、Markuplintの `id-duplication` と `no-refer-to-non-existent-id` で検出します。

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

## 終了タグを省略しない

`p` 要素や `li` 要素など、仕様では終了タグを省略できる要素にも終了タグを書きます。

準拠レベル：**推奨**

**理由**

終了タグを省略すると、要素がどこで終わるかを、仕様の細かな規則から読み取る必要があります。書き換えたときに意図せず入れ子が変わる原因にもなります。終了タグをすべて書いておけば、構造が目で見て分かります。

このルールは、Markuplintの `end-tag` で検出します。

**良い例**

```html
<ul>
  <li>注文の確認</li>
  <li>お支払い</li>
</ul>
```

**悪い例**

```html
<ul>
  <li>注文の確認
  <li>お支払い
</ul>
```

## 余白を作るためにbr要素を使わない

`br` 要素は、住所や詩のように、改行そのものが内容の一部である場合だけに使います。段落や部品の間の余白は、要素を分けてCSSで作ります。

準拠レベル：**推奨**

**理由**

`br` 要素を重ねて作った余白は、画面の幅や文字サイズが変わると崩れます。段落を `br` で区切ると、支援技術には1つの段落として伝わり、構造が失われます。

`br` 要素が連続していることは、Markuplintの `no-consecutive-br` で検出します。

**良い例**

```html
<p>ご注文ありがとうございました。</p>
<p>発送の準備ができしだい、メールでお知らせします。</p>

<address>
  〒100-0001<br />
  東京都千代田区千代田1-1
</address>
```

**悪い例**

```html
<p>
  ご注文ありがとうございました。<br />
  <br />
  発送の準備ができしだい、メールでお知らせします。
</p>
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
  <div class="order-list">…</div>
</section>
```

**悪い例**

```html
<section class="wrapper">
  <section class="order-list">…</section>
</section>
```

## button要素にはtype属性を書く

`button` 要素には、必ず `type` 属性を書きます。フォームを送信するボタンは `type="submit"`、それ以外は `type="button"` にします。

準拠レベル：**必須**

**理由**

`type` 属性を省略した `button` 要素は、送信ボタン（`type="submit"`）として扱われます。フォームの中に置いた「戻る」や「行を追加」のボタンを押すと、意図せずフォームが送信されてしまいます。

このルールは、Markuplintの `required-attr` で検出します。設定はこのページの冒頭を参照してください。

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
  document.querySelector("#search-form").addEventListener("submit", (event) => {
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
  document.querySelector("#search-button").addEventListener("click", () => {
    search(document.querySelector("#keyword").value);
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

## 外部のスクリプトはdeferかtype="module"で読み込む

`script` 要素で外部のファイルを読み込むときは、`defer` 属性を付けるか、`type="module"` にします。`script` 要素は `head` 要素の中に書きます。

準拠レベル：**推奨**

**理由**

`defer` も `type="module"` もない `script` 要素は、読み込みと実行が終わるまでHTMLの解析を止め、ページの表示を遅らせます。`defer` か `type="module"` にすれば、HTMLの解析と並行して読み込み、解析が終わってから書いた順に実行します。`head` 要素に置くことで、読み込みを早く始められます。

`defer` 属性がないことは、Markuplintの `required-attr` で検出します。

**良い例**

```html
<head>
  <script src="/scripts/main.js" type="module"></script>
  <script src="/scripts/legacy-widget.js" defer></script>
</head>
```

**悪い例**

```html
<head>
  <script src="/scripts/main.js"></script>
</head>
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
