---
title: 命名規則
description: 変数、関数、型、ファイル、ディレクトリの名前の付け方。記法と、名前に使う語の選び方を決めます。
---

変数、関数、型、ファイル、ディレクトリの名前の付け方を決めます。CSSのクラス名の付け方は[CSS](/coding-guidelines/tech/css/)、画像のファイル名は[画像](/coding-guidelines/common/images/)のページで扱います。

## 名前は英語で付ける

名前には英単語を使います。ローマ字や日本語は使いません。

準拠レベル：**必須**

**理由**

ローマ字は読み方が人によって揺れ（`shohin` / `syouhin`）、検索しても見つかりません。英語にそろえれば、ライブラリやWeb標準のAPIの名前と並べても違和感なく読めます。英語に訳しにくい業務用語は、プロジェクトで訳語を決めて用語集に残します。

**良い例**

```ts
const productPrice = 1200;
const shippingAddress = getShippingAddress(order);
```

**悪い例**

```ts
const shohinKakaku = 1200;
const 配送先 = getHaisosaki(order);
```

## 識別子の種類ごとに決まった記法を使う

識別子の記法は、種類ごとに次の表のとおりにします。

| 対象 | 記法 | 例 |
| :-- | :-- | :-- |
| 変数、関数、引数、プロパティ | キャメルケース | `userName`、`fetchUser` |
| 型、インターフェース、クラス、Reactコンポーネント | パスカルケース | `UserProfile` |
| モジュールの最上位に置く、変わらない値 | アッパースネークケース | `MAX_RETRY_COUNT` |
| 環境変数 | アッパースネークケース | `API_BASE_URL` |

準拠レベル：**必須**

**理由**

記法を見るだけで、それが値なのか型なのか、実行中に変わりうるのかが分かるようにするためです。アッパースネークケースは、設定値のように「プログラムの外から決まり、変わらない値」だけに使います。関数の中の `const` には使いません。

略語も1つの単語として扱い、先頭以外は小文字にします（`userId`、`HtmlParser`）。`userID` や `HTMLParser` のように大文字を続けると、単語の切れ目が分からなくなるためです。

**良い例**

```ts
const MAX_RETRY_COUNT = 3;

type UserProfile = {
  userId: string;
  displayName: string;
};

function formatDisplayName(profile: UserProfile) {
  const trimmedName = profile.displayName.trim();
  return trimmedName;
}
```

**悪い例**

```ts
const maxRetryCount = 3;

type userProfile = {
  user_id: string;
  DisplayName: string;
};

function FormatDisplayName(profile: userProfile) {
  const TRIMMED_NAME = profile.DisplayName.trim();
  return TRIMMED_NAME;
}
```

## ファイル名とディレクトリ名はケバブケースにする

ファイル名とディレクトリ名は、英小文字とハイフンだけのケバブケースにします。Reactコンポーネントを定義するファイルだけは、コンポーネント名と同じパスカルケースにします。

準拠レベル：**必須**

**理由**

macOSやWindowsは、標準ではファイル名の大文字と小文字を区別しません。大文字と小文字を混ぜると、ある環境では動き、別の環境では動かないimportが生まれます。記法をケバブケースにそろえておけば、この事故が起きません。

Reactコンポーネントのファイルは、ファイル名とコンポーネント名が一致しているほうが探しやすいため、例外としてパスカルケースにします。

このルールはOxlintの `unicorn/filename-case` で検出します。設定は[フォーマットとLint](/coding-guidelines/common/format-and-lint/)を参照してください。

**良い例**

```text
src/
├── features/
│   └── order-history/
│       ├── OrderHistoryList.tsx
│       ├── use-order-history.ts
│       └── format-order-date.ts
└── utils/
    └── parse-query-string.ts
```

**悪い例**

```text
src/
├── features/
│   └── OrderHistory/
│       ├── orderHistoryList.tsx
│       ├── useOrderHistory.ts
│       └── format_order_date.ts
└── Utils/
    └── parseQueryString.ts
```

## 略語は広く通じるものだけ使う

名前は単語を省略せずに書きます。略語は、`id`、`url`、`html`、`api` のように、略さない形より広く通じるものだけ使います。

準拠レベル：**推奨**

**理由**

`usr` や `cnt` のような略語は、書いた本人には分かっても、読む人には意味を推測させます。エディタの補完があるため、長い名前でも書く手間はほとんど増えません。

**良い例**

```ts
const userCount = users.length;
const requestUrl = new URL("/api/orders", baseUrl);
```

**悪い例**

```ts
const usrCnt = usrs.length;
const reqU = new URL("/api/orders", bUrl);
```

## 1文字の名前は短い範囲だけで使う

`i` や `x` のような1文字の名前は、数行で終わるループやコールバックの中だけで使います。

準拠レベル：**推奨**

**理由**

名前が短いほど、読む人は宣言を見に戻らないと意味が分かりません。宣言と使う場所が数行以内に収まる範囲なら、1文字でも迷いません。範囲が広くなるほど、名前は具体的にします。

**良い例**

```ts
const total = items.reduce((sum, item) => sum + item.price, 0);

for (let i = 0; i < rows.length; i++) {
  rows[i].index = i;
}
```

**悪い例**

```ts
function render(d: Order[]) {
  const t = d.filter((o) => o.s === "paid");
  // …数十行後
  return t.map((o) => o.id);
}
```

## 真偽値の名前は is / has / can / should で始める

真偽値を入れる変数、プロパティ、真偽値を返す関数の名前は、`is`、`has`、`can`、`should` のいずれかで始めます。

準拠レベル：**推奨**

**理由**

名前を読むだけで、値が真偽値であることと、真のときの意味が分かるようにするためです。`open` や `error` のような名前は、真偽値なのか、関数やオブジェクトなのかが分かりません。

**良い例**

```ts
const isOpen = true;
const hasError = errors.length > 0;
const canSubmit = isValid && !isSubmitting;

function shouldShowBanner(user: User) {
  return !user.hasDismissedBanner;
}
```

**悪い例**

```ts
const open = true;
const error = errors.length > 0;
const submit = isValid && !isSubmitting;

function banner(user: User) {
  return !user.dismissed;
}
```

## 否定の意味を含む名前を避ける

真偽値の名前には、`not` や `no` を含めません。

準拠レベル：**推奨**

**理由**

否定を含む名前を否定すると、`!isNotVisible` のような二重否定になり、読み間違えやすくなります。`isHidden` や `isVisible` のように肯定の形で名前を付けます。

**良い例**

```ts
const isVisible = !isHidden;

if (!isVisible) {
  return null;
}
```

**悪い例**

```ts
const isNotVisible = isHidden;

if (!isNotVisible) {
  showPanel();
}
```

## 関数名は動詞で始める

関数名は、処理の内容を表す動詞で始めます。

準拠レベル：**推奨**

**理由**

関数は何かをするものなので、動詞で始めると変数や値と区別できます。動詞には、何をするかが分かる具体的なものを選びます。たとえば、通信して取ってくる処理は `fetch`、計算して求める処理は `calculate`、形を変える処理は `format` や `parse` とし、何でも `get` や `process` にはしません。

**良い例**

```ts
async function fetchOrders(userId: string) {}
function calculateTotalPrice(items: CartItem[]) {}
function formatPrice(price: number) {}
```

**悪い例**

```ts
async function orders(userId: string) {}
function totalPrice(items: CartItem[]) {}
function priceProcess(price: number) {}
```

## 配列などの集まりは複数形にする

配列、`Set`、`Map` など、複数の値を持つものの名前は複数形にします。

準拠レベル：**推奨**

**理由**

単数形と複数形で、1件なのか複数件なのかを区別できます。`users.map((user) => …)` のように、集まりと要素の名前が自然に対応します。`userList` や `userArray` のように型を表す語を付けるのではなく、`users` のように複数形にします。

**良い例**

```ts
const users = await fetchUsers();
const activeUserIds = new Set(users.filter((user) => user.isActive).map((user) => user.id));
```

**悪い例**

```ts
const user = await fetchUsers();
const activeUserId = new Set(user.filter((u) => u.isActive).map((u) => u.id));
```

## 単位のある数値は名前に単位を含める

時間、長さ、データ量など単位のある数値は、名前の末尾に単位を付けます。

準拠レベル：**推奨**

**理由**

`timeout = 3000` だけでは、3000ミリ秒なのか3000秒なのかが分かりません。名前に単位があれば、単位の取り違えによる不具合を書いた時点で気づけます。

**良い例**

```ts
const timeoutMs = 3000;
const maxFileSizeBytes = 5 * 1024 * 1024;
const cacheTtlSeconds = 60;
```

**悪い例**

```ts
const timeout = 3000;
const maxFileSize = 5 * 1024 * 1024;
const cacheTtl = 60;
```

## 同じものには同じ語を使う

同じ概念には、プロジェクト全体で同じ語を使います。別の語を使うのは、別の概念を指すときだけにします。

準拠レベル：**推奨**

**理由**

`user`、`member`、`account` が混ざっていると、読む人は「違うものなのか」と考えて、定義を確かめに行くことになります。語をそろえておけば検索でもまとめて見つかります。迷う語は、プロジェクトの用語集に決めておきます。

**良い例**

```ts
type Customer = { customerId: string };

function fetchCustomer(customerId: string) {}
function updateCustomer(customer: Customer) {}
```

**悪い例**

```ts
type Customer = { userId: string };

function fetchMember(accountId: string) {}
function updateClient(customer: Customer) {}
```
