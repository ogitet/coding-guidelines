---
title: アクセシビリティ
description: 障害の有無や利用環境に関わらず使えるWebページを作るためのルール。WCAG 2.2のレベルAAを目標にします。
---

障害の有無や、使う機器・環境に関わらず、誰でも内容を知り、操作できるWebページを作るためのルールを決めます。このページのルールは、[WCAG 2.2](https://www.w3.org/TR/WCAG22/)のレベルAAを満たすことを目標にしています。

HTML、CSS、Reactのページでアクセシビリティに関わるルールは、すべてこのページに書きます。ルールを守れているかを確かめる方法（axe、キーボード操作、スクリーンリーダーでの確認など）は、[検証](/coding-guidelines/quality/verification/)のページで扱います。

## 意味に合ったHTML要素を使う

要素は、見た目ではなく意味で選びます。ボタンには `button`、リンクには `a`、ナビゲーションには `nav` のように、役割に合った要素を使います。

準拠レベル：**必須**

**理由**

スクリーンリーダーなどの支援技術は、要素の種類から「ボタン」「リンク」「見出し」といった役割を読み取ります。`div` で作ったボタンは、ただの文字として扱われ、キーボードでフォーカスもできません。`button` を使えば、フォーカス、Enterキーとスペースキーでの操作、役割の通知がすべて標準で手に入ります。

ボタンとリンクは、ページを移動するなら `a`、ページ内で何かを実行するなら `button` と使い分けます。

このルールの一部は、Oxlintの `jsx-a11y/no-static-element-interactions` などで検出します。

**良い例**

```html
<nav aria-label="メイン">
  <ul>
    <li><a href="/products/">商品一覧</a></li>
  </ul>
</nav>
<button type="button" onclick="addToCart()">カートに入れる</button>
```

**悪い例**

```html
<div class="nav">
  <div class="nav-item" onclick="location.href = '/products/'">商品一覧</div>
</div>
<div class="button" onclick="addToCart()">カートに入れる</div>
```

## ARIAはHTMLで表せないときだけ使う

`role` や `aria-*` 属性は、HTMLの要素や属性では表せない役割や状態を伝えるときだけ使います。

準拠レベル：**必須**

**理由**

ARIAは、支援技術への伝え方を上書きするものです。HTMLが標準で伝えている役割を重ねて書いても意味がなく、誤った値を書けば、正しく伝わっていた情報を壊します。トグルボタンの押下状態（`aria-pressed`）や、開閉の状態（`aria-expanded`）のように、HTMLだけでは表せないものに絞って使います。

このルールの一部は、Oxlintの `jsx-a11y/prefer-tag-over-role` で検出します。

**良い例**

```html
<button type="button" aria-expanded="false" aria-controls="filter-panel">絞り込み</button>
<div id="filter-panel" hidden>…</div>
```

**悪い例**

```html
<nav role="navigation">…</nav>
<button role="button">絞り込み</button>
<span role="button" tabindex="0">閉じる</span>
```

## ページの言語を指定する

`html` 要素の `lang` 属性で、ページの言語を指定します。ページの一部が別の言語なら、その部分にも `lang` 属性を付けます。

準拠レベル：**必須**

**理由**

スクリーンリーダーは `lang` 属性を見て、読み上げに使う言語を切り替えます。指定がないと、日本語を英語の発音で読み上げるなど、内容が伝わらなくなります。ブラウザの自動翻訳や、日本語向けのフォントの選択にも使われます。

このルールは、Markuplintの `required-attr` とOxlintの `jsx-a11y/html-has-lang` で検出します。

**良い例**

```html
<html lang="ja">
  …
  <p>このサービスの名前は <span lang="en">Order Manager</span> です。</p>
</html>
```

**悪い例**

```html
<html>
  …
</html>
```

## ページごとに内容を表すタイトルを付ける

`title` 要素には、ページごとに内容を表す固有のタイトルを付けます。形式は「ページ名 | サイト名」とします。

準拠レベル：**必須**

**理由**

ページのタイトルは、ページを開いたときに最初に読み上げられ、ブラウザのタブや履歴、ブックマークにも表示されます。すべてのページが同じタイトルだと、どのページにいるのかが分かりません。ページ名を先に置くのは、タブが狭くても区別できるようにするためです。

シングルページアプリケーションでは、画面が切り替わるたびにタイトルも変えます。

**良い例**

```html
<title>注文履歴 | Order Manager</title>
```

**悪い例**

```html
<title>Order Manager</title>
```

## 見出しのレベルを飛ばさない

見出しは、内容の階層に合わせて `h1` から順に使い、レベルを飛ばしません。文字の大きさを変えたいだけのときは、見出しのレベルではなくCSSで調整します。

準拠レベル：**推奨**

**理由**

スクリーンリーダーの利用者は、見出しの一覧を使ってページの構成をつかみ、読みたい場所へ移動します。レベルが飛んでいると、間の見出しが抜けているのではないかと迷わせます。見た目の大きさで見出しのレベルを選ぶと、構成と見た目が食い違います。

**良い例**

```html
<h1>注文履歴</h1>
<section>
  <h2>2026年11月</h2>
  <h3>注文番号 1024</h3>
</section>
```

**悪い例**

```html
<h1>注文履歴</h1>
<section>
  <h4>2026年11月</h4>
  <h2>注文番号 1024</h2>
</section>
```

## リンクの文言だけで行き先が分かるようにする

リンクのテキストは、それだけを読んでも行き先が分かる内容にします。「こちら」「詳しくはこちら」のようなテキストにしません。

準拠レベル：**推奨**

**理由**

スクリーンリーダーには、ページ内のリンクだけを一覧にして移動する機能があります。一覧に「こちら」が並んでいると、どれがどこへのリンクか分かりません。目で読む場合も、行き先が分かるリンクのほうが早く見つけられます。

**良い例**

```html
<p><a href="/guide/returns/">返品の手続き</a>をご確認ください。</p>
```

**悪い例**

```html
<p>返品の手続きについては<a href="/guide/returns/">こちら</a>をご確認ください。</p>
```

## 画像には内容を伝える代替テキストを付ける

`img` 要素には必ず `alt` 属性を付けます。内容を伝える画像には、画像が伝えている情報を文章で書きます。装飾のための画像や、隣のテキストと同じ内容の画像には、空の `alt=""` を付けます。

準拠レベル：**必須**

**理由**

代替テキストは、画像を見られない人に対して、画像の代わりに読み上げられます。`alt` 属性がないと、ファイル名が読み上げられることがあります。装飾の画像に代替テキストを付けると、意味のない情報を聞かせることになるため、空にして読み飛ばさせます。

代替テキストには「〜の画像」と書かず、画像が伝えている内容そのものを書きます。リンクになっている画像には、リンク先を表すテキストを書きます。

`alt` 属性がないことは、Oxlintの `jsx-a11y/alt-text` とMarkuplintの `require-accessible-name` で検出します。代替テキストの内容が適切かは、人が確かめます。画像のそのほかの扱いは[画像](/coding-guidelines/common/images/)のページを参照してください。

**良い例**

```html
<img src="/images/sales-2026.png" alt="2026年の売上は前年比120%で、10月が最も多い" width="640" height="360" />
<img src="/images/divider.svg" alt="" width="640" height="8" />
<a href="/"><img src="/images/logo.svg" alt="Order Manager トップページ" width="160" height="40" /></a>
```

**悪い例**

```html
<img src="/images/sales-2026.png" width="640" height="360" />
<img src="/images/divider.svg" alt="区切り線の画像" width="640" height="8" />
<a href="/"><img src="/images/logo.svg" alt="ロゴ" width="160" height="40" /></a>
```

## アイコンだけのボタンやリンクに名前を付ける

アイコンだけで表したボタンやリンクには、操作を表すテキストを付けます。テキストは、画面に表示しない場合でも、`aria-label` か、見た目だけ隠したテキストで付けます。アイコンの画像自体は、支援技術から隠します。

準拠レベル：**必須**

**理由**

アイコンの意味は見た目でしか伝わらないため、名前がないボタンは「ボタン」としか読み上げられず、何をするのか分かりません。アイコンの画像にまで名前があると、同じ内容が二重に読み上げられるため、`aria-hidden="true"` で隠します。

このルールは、Markuplintの `require-accessible-name` とOxlintの `jsx-a11y/control-has-associated-label` で検出します。

**良い例**

```html
<button type="button" aria-label="メニューを開く">
  <svg aria-hidden="true" width="24" height="24">…</svg>
</button>

<a href="/cart/">
  <svg aria-hidden="true" width="24" height="24">…</svg>
  <span class="visually-hidden">カート</span>
</a>
```

```css
/* 見た目だけ隠し、支援技術には読ませる */
.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

**悪い例**

```html
<button type="button">
  <svg width="24" height="24">…</svg>
</button>

<a href="/cart/">
  <svg width="24" height="24">…</svg>
</a>
```

## フォームの入力欄にラベルを関連付ける

入力欄には、`label` 要素で、何を入力するかを表すラベルを関連付けます。`placeholder` をラベルの代わりにしません。

準拠レベル：**必須**

**理由**

ラベルを関連付けると、入力欄にフォーカスしたときにラベルが読み上げられます。ラベルをクリックすれば入力欄にフォーカスできるため、チェックボックスのような小さな部品も操作しやすくなります。`placeholder` は入力を始めると消えるため、何を入力していたのかが分からなくなり、文字色も薄く読みにくくなります。

このルールは、Oxlintの `jsx-a11y/label-has-associated-control` とMarkuplintの `require-accessible-name` で検出します。

**良い例**

```html
<label for="email">メールアドレス</label>
<input id="email" type="email" name="email" autocomplete="email" />

<label>
  <input type="checkbox" name="newsletter" />
  お知らせメールを受け取る
</label>
```

**悪い例**

```html
<input type="email" name="email" placeholder="メールアドレス" />

<input type="checkbox" name="newsletter" />
<span>お知らせメールを受け取る</span>
```

## 個人の情報を入力する欄にはautocompleteを指定する

氏名、メールアドレス、電話番号、住所、パスワードなど、使う人自身の情報を入力する欄には、内容に合った `autocomplete` 属性の値を指定します。

準拠レベル：**必須**

**理由**

`autocomplete` を指定すると、ブラウザやパスワード管理ツールが、保存してある情報を正しい欄に入力できます。文字の入力に時間がかかる人や、何を入力する欄かを読み取りにくい人も、入力の手間と誤りを減らせます。WCAG 2.2の達成基準1.3.5（入力目的の特定）にも対応します。

入力欄の `type` の選び方は、[HTML](/coding-guidelines/tech/html/#入力欄には内容に合ったtypeを指定する)のページを参照してください。

**良い例**

```html
<label for="name">氏名</label>
<input id="name" type="text" name="name" autocomplete="name" />

<label for="postal-code">郵便番号</label>
<input id="postal-code" type="text" name="postalCode" inputmode="numeric" autocomplete="postal-code" />

<label for="new-password">新しいパスワード</label>
<input id="new-password" type="password" name="newPassword" autocomplete="new-password" />
```

**悪い例**

```html
<label for="name">氏名</label>
<input id="name" type="text" name="name" />

<label for="new-password">新しいパスワード</label>
<!-- 保存したパスワードの入力や、新しいパスワードの提案を止めている -->
<input id="new-password" type="password" name="newPassword" autocomplete="off" />
```

## 入力エラーはテキストで示し、入力欄と関連付ける

入力内容にエラーがあるときは、何が誤りでどう直せばよいかをテキストで表示します。エラーの入力欄には `aria-invalid="true"` を付け、`aria-describedby` でエラーメッセージと関連付けます。

準拠レベル：**必須**

**理由**

入力欄の枠を赤くするだけでは、色を見分けにくい人やスクリーンリーダーの利用者には、エラーがあることが伝わりません。メッセージを入力欄と関連付けると、入力欄にフォーカスしたときにエラーの内容も読み上げられます。

**良い例**

```html
<label for="email">メールアドレス</label>
<input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
<p id="email-error">メールアドレスに「@」が含まれていません。例：name@example.com</p>
```

**悪い例**

```html
<label for="email">メールアドレス</label>
<input id="email" type="email" class="is-error" />
<p class="error-text">入力内容が正しくありません</p>
```

## すべての操作をキーボードでできるようにする

マウスでできる操作は、すべてキーボードだけでもできるようにします。マウスを乗せたときだけ表示されるメニューなど、マウスに頼った操作は作りません。

準拠レベル：**必須**

**理由**

手の障害などでマウスを使えない人や、スクリーンリーダーの利用者は、キーボードやそれに代わる機器で操作します。キーボードで操作できない部品があると、その先の機能を一切使えなくなります。

このルールの一部は、Oxlintの `jsx-a11y/click-events-have-key-events` と `jsx-a11y/mouse-events-have-key-events` で検出します。

**良い例**

```html
<button type="button" aria-expanded="false" aria-controls="account-menu">アカウント</button>
<ul id="account-menu" hidden>
  <li><a href="/settings/">設定</a></li>
  <li><a href="/logout/">ログアウト</a></li>
</ul>
```

**悪い例**

```html
<!-- マウスを乗せたときだけ開き、キーボードでは開けない -->
<div class="account" onmouseenter="openMenu()" onmouseleave="closeMenu()">
  アカウント
  <ul class="account-menu">…</ul>
</div>
```

## フォーカスの位置を見えるようにする

キーボードでフォーカスしている要素には、目に見える印を表示します。`outline: none` などでフォーカスの表示を消しません。

準拠レベル：**必須**

**理由**

キーボードで操作する人は、フォーカスの印を見て、いまどこを操作しているかを知ります。印が消えていると、Enterキーを押したときに何が起きるかが分かりません。マウスでクリックしたときの枠が気になる場合は、表示を消すのではなく `:focus-visible` を使い、キーボード操作のときだけ表示します。

**良い例**

```css
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}
```

**悪い例**

```css
button:focus {
  outline: none;
}
```

## tabindexに正の値を使わない

`tabindex` 属性には `0` か `-1` だけを使います。`1` 以上の値は使いません。

準拠レベル：**必須**

**理由**

`tabindex` に正の値を付けた要素は、ページの並び順に関係なく先にフォーカスされます。画面上の並びとフォーカスの順番が食い違い、キーボードで操作する人を迷わせます。フォーカスの順番は、HTMLの並び順で整えます。

このルールは、Oxlintの `jsx-a11y/tabindex-no-positive` で検出します。

**良い例**

```html
<input id="keyword" type="search" />
<button type="submit">検索</button>
<div id="results" tabindex="-1">…</div>
```

**悪い例**

```html
<input id="keyword" type="search" tabindex="2" />
<button type="submit" tabindex="1">検索</button>
```

## モーダルダイアログにはdialog要素を使う

モーダルダイアログは `dialog` 要素で作り、`showModal()` で開きます。

準拠レベル：**推奨**

**理由**

モーダルダイアログには、開いたときにフォーカスを中へ移す、背後のコンテンツを操作できなくする、Escキーで閉じる、閉じたら元の位置にフォーカスを戻す、といった振る舞いが必要です。`div` で作るとこれらをすべて自分で実装することになり、漏れが出やすくなります。`dialog` 要素と `showModal()` を使えば、これらがブラウザの標準の動作として手に入ります。

**良い例**

```html
<button type="button" onclick="document.querySelector('#confirm').showModal()">削除</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h2 id="confirm-title">注文を削除しますか？</h2>
  <form method="dialog">
    <button value="cancel">キャンセル</button>
    <button value="delete">削除する</button>
  </form>
</dialog>
```

**悪い例**

```html
<div class="modal" style="display: block">
  <div class="modal-title">注文を削除しますか？</div>
  <div class="button" onclick="closeModal()">キャンセル</div>
  <div class="button" onclick="deleteOrder()">削除する</div>
</div>
```

## 色だけで情報を伝えない

エラー、必須項目、選択中の状態、リンクなどを、色の違いだけで表しません。テキスト、アイコン、下線、形など、色以外の手がかりも合わせて使います。

準拠レベル：**必須**

**理由**

色の見え方は人によって異なり、色を見分けにくい人もいます。白黒の印刷や、画面の明るさによっても色の違いは伝わりにくくなります。本文中のリンクは、色だけでなく下線でも区別します。

**良い例**

```html
<label for="name">お名前<span class="required">（必須）</span></label>
<input id="name" type="text" required />
```

```css
.content a {
  color: var(--color-link);
  text-decoration: underline;
}
```

**悪い例**

```html
<!-- 必須であることを赤い文字色だけで示している -->
<label for="name" class="required-color">お名前</label>
<input id="name" type="text" required />
```

```css
.content a {
  color: var(--color-link);
  text-decoration: none;
}
```

## 文字と背景のコントラスト比を確保する

文字と背景のコントラスト比は4.5:1以上にします。大きな文字（おおむね24px以上、太字なら約18.7px以上）と、入力欄の枠やアイコンなど操作に必要な部品、フォーカスの印は3:1以上にします。

準拠レベル：**必須**

**理由**

コントラストが低いと、視力の弱い人や、屋外で画面を見ている人には文字が読めません。デザインの段階で配色が決まっている場合も、実装の前に比を確かめ、基準を満たさない色はデザイナーと相談して決め直します。

**良い例**

```css
/* 白の背景に対して 4.54:1 */
.note {
  color: #767676;
  background-color: #ffffff;
}
```

**悪い例**

```css
/* 白の背景に対して 2.85:1 */
.note {
  color: #999999;
  background-color: #ffffff;
}
```

## ブラウザの拡大と文字サイズの設定を妨げない

ページの拡大を禁止しません。文字サイズは `rem` などの相対的な単位で指定し、ブラウザで設定した文字サイズに合わせて変わるようにします。

準拠レベル：**必須**

**理由**

視力の弱い人は、ページを拡大したり、ブラウザの標準の文字サイズを大きくしたりして読みます。`viewport` で拡大を禁止したり、文字サイズを `px` で固定したりすると、こうした設定が効かなくなります。文字を200%に拡大しても、内容が欠けたり重なったりしないようにします。

**良い例**

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

```css
body {
  font-size: 1rem;
}
```

**悪い例**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

```css
body {
  font-size: 14px;
}
```

## クリックできる領域は24×24px以上にする

ボタンやリンクなど、クリック・タップできる部品の領域は、24×24px以上にします。

準拠レベル：**必須**

**理由**

小さな部品は、手の震えがある人や、指で操作する人には押しにくく、隣の部品を誤って押す原因になります。24×24pxはWCAG 2.2のレベルAAの最低限の大きさです。主な操作のボタンなど、余裕がある部品は44×44px以上を目安にします。

見た目のアイコンが小さい場合も、`padding` で押せる領域を広げます。

**良い例**

```css
.icon-button {
  display: inline-grid;
  place-items: center;
  min-inline-size: 44px;
  min-block-size: 44px;
}
```

**悪い例**

```css
.icon-button {
  inline-size: 16px;
  block-size: 16px;
  padding: 0;
}
```

## 動きを減らす設定を尊重する

アニメーションや自動で動く表現は、利用者がOSで「視差効果を減らす」などの設定をしている場合（`prefers-reduced-motion: reduce`）には止めるか、最小限にします。

準拠レベル：**推奨**

**理由**

大きな動きや画面の揺れは、前庭障害のある人にめまいや吐き気を起こさせることがあります。OSの設定で動きを減らしている人には、その意思を尊重します。自動で切り替わるカルーセルのように5秒以上動き続けるものには、この設定に関わらず、止めるボタンを付けます。

**良い例**

```css
.card {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
}
```

**悪い例**

```css
/* 動きを減らす設定をしていても、常に大きく動く */
.hero {
  animation: parallax 10s linear infinite;
}
```

## 画面の変化を支援技術にも伝える

「カートに追加しました」「保存しました」のように、ページを移動せずに表示されるお知らせは、`role="status"` などのライブリージョンで支援技術にも伝えます。

準拠レベル：**必須**

**理由**

スクリーンリーダーは、フォーカスしている場所の周りしか読み上げません。画面の別の場所にお知らせが出ても、ライブリージョンでなければ気づけません。ライブリージョンの要素は最初からページに置いておき、中のテキストだけを書き換えます。要素ごと後から追加すると、読み上げられないことがあります。

すぐに伝えるべきエラーには `role="alert"` を使い、それ以外は `role="status"` を使います。

**良い例**

```html
<!-- 最初から置いておき、テキストだけを書き換える -->
<p role="status" id="cart-status"></p>

<script>
  document.querySelector("#cart-status").textContent = "カートに追加しました";
</script>
```

**悪い例**

```html
<script>
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "カートに追加しました";
  document.body.append(toast);
</script>
```
