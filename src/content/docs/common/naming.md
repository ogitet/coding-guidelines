---
title: 命名規則
description: 変数、関数、型、ファイル、ディレクトリの名前の付け方。記法と、名前に使う語の選び方を決めます。
---

変数、関数、型、ファイル、ディレクトリの名前の付け方を決めます。CSSのクラス名の付け方は[CSS](/coding-guidelines/tech/css/)のページで扱います。

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
type UserProfile = { userId: string };

function fetchUserProfile(userId: string) {}
```

**悪い例**

```ts
type userProfile = { userID: string };

function FetchUserProfile(user_id: string) {}
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

## 真偽値の名前は is / has / can / should で始める

真偽値を入れる変数、プロパティ、真偽値を返す関数の名前は、`is`、`has`、`can`、`should` のいずれかで始めます。

準拠レベル：**推奨**

**理由**

名前を読むだけで、値が真偽値であることと、真のときの意味が分かるようにするためです。`open` や `error` のような名前は、真偽値なのか、関数やオブジェクトなのかが分かりません。また、`isNotVisible` のような否定の形にはしません。`!isNotVisible` のような二重否定になり、読み間違えやすくなるためです。

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
