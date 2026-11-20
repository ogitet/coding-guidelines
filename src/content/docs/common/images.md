---
title: 画像
description: Webページに使う画像の形式、サイズ、読み込み方、SVGの扱い。
---

Webページに使う画像の形式、サイズ、読み込み方、SVGの扱いを決めます。代替テキスト（`alt` 属性）は[アクセシビリティ](/coding-guidelines/quality/accessibility/#画像には内容を伝える代替テキストを付ける)のページで扱います。

## 画像の形式は内容に合わせて選ぶ

画像の形式は、内容に応じて次の表から選びます。

| 内容 | 形式 |
| :-- | :-- |
| 写真、グラデーションの多いイラスト、SVGにできない透過のある画像 | AVIF |
| ロゴ、アイコン、図、単純なイラスト | SVG |
| 動きのある画像 | 動画（MP4、WebM） |

準拠レベル：**推奨**

**理由**

AVIFは、JPEGやPNGと同じ画質でもファイルサイズを大きく減らせ、透過も扱えます。ロゴやアイコンのような図形はSVGにすれば、どれだけ拡大してもぼやけず、ファイルも小さく済みます。アニメーションGIFは、同じ内容の動画に比べてファイルサイズが何倍にもなるため使いません。

[対応ブラウザ](/coding-guidelines/about/environment/)にAVIFを表示できない環境が含まれる場合は、`picture` 要素でWebPかJPEGも合わせて出します。

**良い例**

```text
hero.avif
logo.svg
icon-cart.svg
product-demo.mp4
```

**悪い例**

```text
hero.png         # 写真をPNGで書き出している
logo.jpg         # ロゴをJPEGで書き出している
product-demo.gif # 動きのある画像をGIFにしている
```

## 書き出したままの画像を置かない

ラスター画像は、表示する最大の幅の2倍を上限に縮小し、圧縮してから置きます。SVGは、[SVGO](https://svgo.dev/)などで不要な情報を取り除いてから置き、`viewBox` 属性は残します。

準拠レベル：**推奨**

**理由**

表示サイズより大きな画像は、見た目は変わらないのに通信量と表示までの時間だけを増やします。高精細なディスプレイでもぼやけないように、表示幅の2倍までは用意します。圧縮率は、劣化が気にならない範囲を目で確かめながら決めます。

デザインツールから書き出したSVGには、編集用のメタデータや必要以上に細かい座標の値が含まれ、ファイルが大きくなります。`viewBox` を消すと、CSSで大きさを変えたときに図形が切れてしまうため、残します。

**良い例**

```text
# 最大 800px 幅で表示する画像
product-main.avif   1600×1200  120KB
```

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M3 12h18M12 3v18" stroke="currentColor" stroke-width="2" />
</svg>
```

**悪い例**

```text
# 最大 800px 幅で表示する画像
product-main.jpg    6000×4500  8.4MB
```

```html
<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Design Tool 28.0 -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px">
  <title>アートボード 1</title>
  <g id="レイヤー_1" data-name="レイヤー 1">
    <path d="M3.000000 12.000000h18.000000M12.000000 3.000000v18.000000" stroke="#000000" stroke-width="2" />
  </g>
</svg>
```

## 画面に合わせて画像を出し分ける

画面の幅によって表示幅だけが変わる画像は、幅の異なる画像を複数用意し、`srcset` と `sizes` 属性で出し分けます。トリミングや縦横比を変えるとき、または形式の代わりを用意するときは、`picture` 要素を使います。CSSで複数の画像を表示・非表示にして切り替えません。

準拠レベル：**推奨**

**理由**

1つの大きな画像だけを用意すると、スマートフォンでもパソコン向けの大きな画像を読み込むことになります。`srcset` と `sizes`、`picture` 要素を使えば、ブラウザが条件に合う1枚だけを選んで読み込みます。`img` を複数置いてCSSの `display: none` で隠すと、表示しない画像まで読み込まれることがあり、代替テキストも重複します。

**良い例**

```html
<img
  src="/images/hero-1600w.avif"
  srcset="/images/hero-800w.avif 800w, /images/hero-1600w.avif 1600w, /images/hero-2400w.avif 2400w"
  sizes="(min-width: 1200px) 1200px, 100vw"
  alt="…"
  width="1600"
  height="900"
/>
```

```html
<picture>
  <source media="(min-width: 768px)" srcset="/images/campaign-wide.avif" width="1600" height="600" />
  <img src="/images/campaign-square.avif" alt="…" width="800" height="800" />
</picture>
```

**悪い例**

```html
<!-- どの画面幅でも 2400px 幅の画像を読み込む -->
<img src="/images/hero-2400w.avif" alt="…" width="2400" height="1350" />
```

```html
<img class="pc-only" src="/images/campaign-wide.avif" alt="…" width="1600" height="600" />
<img class="sp-only" src="/images/campaign-square.avif" alt="…" width="800" height="800" />
```

## img要素にはwidthとheightを書く

`img` 要素には、画像の元の幅と高さを `width` 属性と `height` 属性で書きます。表示サイズはCSSで調整します。

準拠レベル：**必須**

**理由**

`width` と `height` があれば、ブラウザは画像を読み込む前に縦横比から表示領域を確保できます。書かないと、画像が読み込まれた時点でその下の内容が押し下げられ、読んでいた位置がずれたり、別の場所を誤ってクリックしたりする原因になります。

CSSで `height: auto` を指定しておけば、`width` と `height` 属性を書いたまま、幅に合わせて縮小できます。

このルールは、Markuplintの `required-attr` で検出します。

**良い例**

```html
<img src="/images/product-main.avif" alt="…" width="1600" height="1200" />
```

```css
img {
  max-inline-size: 100%;
  block-size: auto;
}
```

**悪い例**

```html
<img src="/images/product-main.avif" alt="…" />
```

## 位置に合わせて読み込みの優先度を変える

ページを開いた時点で画面に入らない画像には、`loading="lazy"` を付けます。ファーストビューの主な画像（ヒーロー画像など）には、`loading="lazy"` を付けず、`fetchpriority="high"` を付けます。

準拠レベル：**推奨**

**理由**

遅延読み込みにすると、画面に近づくまで画像を読み込まないため、最初の表示が速くなり、通信量も減らせます。`loading` 属性はブラウザの標準の機能なので、JavaScriptのライブラリは使いません。

一方、ファーストビューの大きな画像は、ページが表示されたと感じるまでの時間（LCP）を左右します。遅延読み込みにすると表示が遅れるため、`fetchpriority="high"` を付けて、ほかの画像より先に読み込ませます。

**良い例**

```html
<img src="/images/hero-1600w.avif" alt="…" width="1600" height="900" fetchpriority="high" />
<img src="/images/review-1.avif" alt="…" width="800" height="600" loading="lazy" />
```

**悪い例**

```html
<!-- ファーストビューのヒーロー画像を遅延読み込みしている -->
<img src="/images/hero-1600w.avif" alt="…" width="1600" height="900" loading="lazy" />
```

## 色を変えるアイコンはインラインのSVGにする

文字色や状態に合わせて色を変えるアイコンは、HTMLに直接SVGを書き、色に `currentColor` を使います。色を変えないSVGは、`img` 要素で読み込みます。

準拠レベル：**推奨**

**理由**

インラインのSVGなら、CSSで色を変えられます。`currentColor` を使えば、親の文字色に合わせて色が変わるため、ホバーや無効の状態ごとにアイコンを用意する必要がありません。一方、色を変えないロゴやイラストは、`img` で読み込めばブラウザにキャッシュされ、HTMLも大きくなりません。

アイコンに名前を付ける方法は[アクセシビリティ](/coding-guidelines/quality/accessibility/#アイコンだけのボタンやリンクに名前を付ける)のページを参照してください。

**良い例**

```html
<button type="button" class="icon-button" aria-label="お気に入りに追加">
  <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
    <path fill="currentColor" d="M12 21 …" />
  </svg>
</button>
```

**悪い例**

```html
<!-- 状態ごとに色違いの画像を用意して差し替えている -->
<button type="button" class="icon-button" aria-label="お気に入りに追加">
  <img src="/images/icon-heart-gray.svg" alt="" width="24" height="24" />
</button>
```
