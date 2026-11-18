---
title: セキュリティ
description: フロントエンドの実装で守るセキュリティのルール。秘密情報、XSS、外部のURLとスクリプト、認証情報の保存、依存パッケージの扱いを決めます。
---

フロントエンドの実装で守るセキュリティのルールを決めます。サーバー側の対策（認証、認可、入力の検証など）はこの規約の対象外ですが、フロントエンドの対策だけで安全になるとは考えず、サーバー側でも対策されていることを前提にします。

## 秘密情報をリポジトリに入れない

APIの秘密鍵、パスワード、アクセストークンなどの秘密情報は、リポジトリにコミットしません。秘密情報は `.env` などの環境変数のファイルに書き、そのファイルは `.gitignore` で除外します。必要な環境変数の名前は、値を空にした `.env.example` に書いて共有します。

準拠レベル：**必須**

**理由**

一度コミットした秘密情報は、後のコミットで消しても、Gitの履歴に残ります。リポジトリを公開したり、権限のない人が見られる状態になったりすれば、そのまま悪用されます。誤ってコミットした場合は、履歴から消すだけでなく、その秘密情報を無効にして新しいものに取り替えます。

GitHubのシークレットスキャンとプッシュ保護を有効にして、秘密情報を含むプッシュを止めます。

**良い例**

```sh title=".env.example"
# 決済サービスの公開鍵（ブラウザに渡してよい値）
VITE_PAYMENT_PUBLIC_KEY=
```

```text title=".gitignore（一部）"
.env
.env.*
!.env.example
```

**悪い例**

```ts
// 秘密鍵をコードに直接書いている
const PAYMENT_SECRET_KEY = "sk_live_51H8xY...";
```

## ブラウザに送るコードに秘密情報を含めない

秘密鍵など、使う人に知られてはいけない情報は、ブラウザで動くコードに含めません。秘密情報が必要な処理は、サーバー側で行います。

準拠レベル：**必須**

**理由**

ブラウザに送ったJavaScriptは、誰でも開発者ツールで中身を読めます。圧縮や難読化をしても、値そのものは取り出せます。環境変数を使っていても、ビルドのときにコードへ埋め込まれる変数（Viteの `VITE_` で始まる変数、Next.jsの `NEXT_PUBLIC_` で始まる変数など）は、公開されるものとして扱います。

**良い例**

```ts
// 秘密鍵を使う処理は、サーバー側のAPIに任せる
const response = await fetch("/api/payments", {
  method: "POST",
  body: JSON.stringify({ orderId }),
});
```

**悪い例**

```ts
// VITE_ で始まる変数は、ビルドしたコードにそのまま埋め込まれる
const response = await fetch("https://api.payment.example.com/charges", {
  headers: { Authorization: `Bearer ${import.meta.env.VITE_PAYMENT_SECRET_KEY}` },
});
```

## HTMLを文字列から組み立てない

画面に出す内容は、`textContent` やJSXの式（`{}`）で入れます。`innerHTML`、`insertAdjacentHTML`、Reactの `dangerouslySetInnerHTML` で、文字列からHTMLを組み立てません。CMSの本文など、どうしてもHTMLの文字列を表示する必要がある場合は、[DOMPurify](https://github.com/cure53/DOMPurify)で無害化してから入れます。

準拠レベル：**必須**

**理由**

使う人が入力した値や、APIから受け取った値をHTMLとして入れると、その中に書かれたスクリプトが実行されます（クロスサイトスクリプティング、XSS）。スクリプトが実行されれば、そのページで使う人ができることは、何でも攻撃者にできてしまいます。`textContent` やJSXの式は、値を文字列として扱うため、スクリプトは実行されません。

`dangerouslySetInnerHTML` は、Oxlintの `react/no-danger` で検出します。

**良い例**

```tsx
<p className="review-body">{review.body}</p>
```

```tsx
import DOMPurify from "dompurify";

// CMSで書かれた本文を表示する。無害化してから入れる
// oxlint-disable-next-line react/no-danger -- CMSの本文はHTMLで受け取るため。DOMPurifyで無害化している
<div className="article-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.html) }} />
```

**悪い例**

```ts
reviewElement.innerHTML = `<p>${review.body}</p>`;
```

```tsx
<div dangerouslySetInnerHTML={{ __html: review.body }} />
```

## 文字列をコードとして実行しない

`eval`、`new Function`、文字列を渡す `setTimeout` と `setInterval` を使いません。

準拠レベル：**必須**

**理由**

文字列をコードとして実行すると、その文字列に外部からの値が混ざったときに、任意のコードを実行される入口になります。また、Content Security Policyで `unsafe-eval` を許可しなければならなくなり、ページ全体の守りが弱くなります。

このルールは、Oxlintの `no-eval` と `no-new-func` で検出します。

**良い例**

```ts
const settings = JSON.parse(settingsJson);

setTimeout(() => {
  showBanner();
}, 1000);
```

**悪い例**

```ts
const settings = eval(`(${settingsJson})`);

setTimeout("showBanner()", 1000);
```

## 外部から受け取ったURLは、スキームを確かめてから使う

使う人の入力やAPIから受け取ったURLを、リンクの `href` やリダイレクト先に使うときは、スキームが `https:` か `http:` であることを確かめます。

準拠レベル：**必須**

**理由**

`javascript:` で始まるURLをリンクに入れると、クリックしたときにスクリプトが実行されます。JSXの式で入れても、属性の値としては正しい文字列なので防げません。リダイレクト先を確かめないと、正規のサイトのURLから、偽のサイトへ誘導されることもあります（オープンリダイレクト）。

**良い例**

```ts
const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

function toSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
```

```tsx
<a href={toSafeUrl(profile.websiteUrl)}>Webサイト</a>
```

**悪い例**

```tsx
// "javascript:alert(document.cookie)" が入っていても、そのままリンクになる
<a href={profile.websiteUrl}>Webサイト</a>
```

```ts
// ?next=https://evil.example.com でも移動してしまう
location.href = new URLSearchParams(location.search).get("next") ?? "/";
```

## 認証のトークンをlocalStorageに保存しない

ログイン状態を保つためのトークンは、`localStorage` や `sessionStorage` に保存しません。サーバー側で、`HttpOnly`、`Secure`、`SameSite` の属性を付けたCookieに保存します。

準拠レベル：**推奨**

**理由**

`localStorage` に保存した値は、そのページで動くJavaScriptから読めます。XSSが1か所でもあれば、トークンを盗まれ、攻撃者が別の環境からなりすませます。`HttpOnly` を付けたCookieはJavaScriptから読めないため、XSSがあってもトークンそのものは盗まれません。

APIの仕様などで、Cookieを使えない場合は、トークンをメモリ（変数）にだけ持ち、有効期限を短くします。

**良い例**

```ts
// トークンはサーバーがHttpOnlyのCookieに保存する。ブラウザ側では扱わない
await fetch("/api/login", {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

**悪い例**

```ts
const { accessToken } = await login(email, password);
localStorage.setItem("accessToken", accessToken);
```

## 画面で隠すことを権限の制御にしない

使う人の権限によって操作を制限するときは、サーバー側で制限します。ボタンを隠す、入力欄を無効にする、フロントエンドで入力を検証する、といった画面での対応は、使いやすさのためのものとして扱います。

準拠レベル：**必須**

**理由**

ブラウザで動くコードは、使う人が自由に書き換えられます。開発者ツールを使えば、隠したボタンを表示することも、APIに直接リクエストを送ることもできます。画面での制限だけに頼ると、権限のない人でも操作できてしまいます。

**良い例**

```tsx
// ボタンは隠すが、削除の権限はAPIの側でも確かめている
{user.role === "admin" && (
  <button type="button" onClick={() => deleteUser(targetUser.id)}>
    削除する
  </button>
)}
```

```md
<!-- プルリクエストの「確認したこと」 -->
- 一般ユーザーのCookieで DELETE /api/users/:id を直接呼び、403が返ることを確認
```

**悪い例**

```tsx
// 管理者かどうかの判定が、この表示の切り替えだけで行われている
{user.role === "admin" && <AdminMenu />}
```

## postMessageでは相手のオリジンを確かめる

`postMessage` でメッセージを送るときは、送信先のオリジンを指定します。メッセージを受け取るときは、`event.origin` が想定したオリジンであることを確かめてから処理します。

準拠レベル：**必須**

**理由**

送信先を `"*"` にすると、相手のウィンドウが別のサイトに移動していた場合に、そのサイトへ情報を渡してしまいます。受け取るときにオリジンを確かめないと、どのサイトからでもメッセージを送り込まれ、意図しない処理を実行されます。

**良い例**

```ts
const PAYMENT_ORIGIN = "https://pay.example.com";

paymentFrame.contentWindow?.postMessage({ orderId }, PAYMENT_ORIGIN);

window.addEventListener("message", (event) => {
  if (event.origin !== PAYMENT_ORIGIN) {
    return;
  }
  handlePaymentResult(event.data);
});
```

**悪い例**

```ts
paymentFrame.contentWindow?.postMessage({ orderId }, "*");

window.addEventListener("message", (event) => {
  handlePaymentResult(event.data);
});
```

## Content Security Policyを設定する

Content Security Policy（CSP）のレスポンスヘッダーを設定し、読み込めるスクリプトなどの配信元を必要なものだけに限ります。`unsafe-inline` と `unsafe-eval` は、スクリプトには許可しません。

準拠レベル：**推奨**

**理由**

CSPを設定しておけば、XSSの不具合があった場合でも、外部のスクリプトの読み込みや、埋め込まれたスクリプトの実行をブラウザが止めます。XSSを防ぐルールを守ったうえで、それでも漏れがあったときの守りとして設定します。

ヘッダーは、ホスティングサービスやサーバーの設定で返します。新しく設定するときや、配信元を追加するときは、まず `Content-Security-Policy-Report-Only` で違反を確かめてから適用します。

**良い例**

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

**悪い例**

```text
Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval'
```

## 外部のスクリプトは、自分で配信するかSRIを付ける

外部のライブラリは、npmでインストールして自分のサイトから配信します。CDNなどの外部のサーバーからスクリプトやスタイルシートを読み込む場合は、`integrity` 属性（Subresource Integrity、SRI）を付けます。

準拠レベル：**推奨**

**理由**

外部のサーバーのファイルが書き換えられると、そのファイルを読み込んでいるすべてのサイトで、攻撃者のスクリプトが実行されます。`integrity` 属性を付けておけば、ファイルの中身が変わったときにブラウザが読み込みを止めます。

広告や計測のタグのように、中身が更新され続けるためSRIを付けられないものは、本当に必要かを確かめてから読み込みます。

**良い例**

```html
<script
  src="https://cdn.example.com/chart@4.4.0/chart.min.js"
  integrity="sha384-…"
  crossorigin="anonymous"
></script>
```

**悪い例**

```html
<script src="https://cdn.example.com/chart@latest/chart.min.js"></script>
```

## lockfileをコミットし、CIではnpm ciでインストールする

依存パッケージのバージョンを固定するlockfile（`package-lock.json`）をコミットします。CIや公開用のビルドでは、`npm install` ではなく `npm ci` でインストールします。

準拠レベル：**必須**

**理由**

lockfileがないと、インストールするたびに、その時点の新しいバージョンが入ります。依存パッケージが乗っ取られて悪意のあるバージョンが公開されたとき、確かめていないそのバージョンが気づかないうちに入り込みます。`npm ci` はlockfileのとおりにインストールし、`package.json` と食い違っていれば失敗するため、確かめたバージョンだけでビルドできます。

**良い例**

```yaml title=".github/workflows/check.yml（一部）"
- run: npm ci
- run: npm run check
```

**悪い例**

```yaml title=".github/workflows/check.yml（一部）"
# lockfileがなく、実行するたびに入るバージョンが変わる
- run: npm install
- run: npm run check
```

## 依存パッケージは、追加する前に必要性と信頼性を確かめる

依存パッケージを追加する前に、標準のAPIや既存の依存パッケージで代わりにならないかを確かめます。追加する場合は、パッケージ名の綴り、更新が続いているか、利用者の数、依存パッケージの数を確かめます。

準拠レベル：**推奨**

**理由**

依存パッケージを1つ追加すると、そのパッケージが依存するパッケージもすべて入ります。そのどれかが乗っ取られたり、脆弱性が見つかったりすれば、自分のサイトにも影響します。有名なパッケージに似せた名前の偽のパッケージ（タイポスクワッティング）もあるため、名前の綴りも確かめます。AIが提案したパッケージは、実在するかどうかから確かめます。

**良い例**

```ts
// 日付の表示は標準のAPIで足りるため、ライブラリを追加しない
const formatted = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" }).format(orderedAt);
```

**悪い例**

```sh
# 数行で書ける処理のために、確かめずにパッケージを追加する
npm install is-even left-pad
```

## 依存パッケージの脆弱性を定期的に確かめて更新する

依存パッケージの脆弱性は、Dependabotなどで自動的に検出し、更新のプルリクエストを作らせます。脆弱性の通知が来たら、影響を確かめて、早めに更新します。

準拠レベル：**推奨**

**理由**

依存パッケージの脆弱性は、自分のコードを変えていなくても、日々新しく見つかります。手で確かめる運用では、確かめること自体を忘れます。更新を長く放置すると、まとめて更新するときの変更が大きくなり、さらに更新しにくくなります。

**良い例**

```yaml title=".github/dependabot.yml"
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**悪い例**

```text
$ npm audit
48 vulnerabilities (12 moderate, 30 high, 6 critical)
# 数か月前から、この状態のまま
```

## ログやエラーの表示に秘密情報と個人情報を出さない

`console.log` やエラーの表示、エラーを監視するサービスに送る情報に、パスワード、トークン、個人情報（氏名、住所、メールアドレスなど）を含めません。

準拠レベル：**必須**

**理由**

ブラウザのコンソールは、使う人の環境で誰でも見られます。エラーを監視するサービスに送った情報は、そのサービスにも保存され、見られる人の範囲が広がります。デバッグのために一時的に出したログが、そのまま公開されることもあります。

**良い例**

```ts
console.error("ログインに失敗しました", { status: response.status });
```

**悪い例**

```ts
console.log("login", { email, password });
console.error("APIエラー", { headers: request.headers });
```
