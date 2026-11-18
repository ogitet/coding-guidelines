---
title: エラー処理
description: 失敗の伝え方、例外の捕まえ方と投げ直し方、非同期処理と通信の失敗、使う人に見せるエラーの書き方。
---

失敗をどう伝え、どこで受け止め、使う人にどう見せるかを決めます。

`throw` する値の種類は[TypeScript](/coding-guidelines/tech/typescript/#throwするのはerrorオブジェクトだけにする)、Reactのコンポーネントで起きたエラーの受け止め方は[React](/coding-guidelines/tech/react/#画面の一部で起きたエラーはerror-boundaryで受け止める)、ログに出してはいけない情報は[セキュリティ](/coding-guidelines/quality/security/#ログやエラーの表示に秘密情報と個人情報を出さない)、入力エラーの示し方は[アクセシビリティ](/coding-guidelines/common/accessibility/#入力エラーはテキストで示し入力欄と関連付ける)のページで扱います。

## 想定外の失敗は例外で伝え、想定内の失敗は戻り値で返す

通信の失敗やプログラムの誤りなど、その場で対処できない失敗は、例外を `throw` して呼び出し元に伝えます。入力の検証のように、失敗することが通常の流れの一部である処理は、例外を使わず、成功と失敗を区別できる戻り値で返します。

準拠レベル：**推奨**

**理由**

想定外の失敗を例外で伝えれば、途中の関数が1つずつ失敗を受け渡さなくても、対処できる場所まで自動で伝わります。一方、入力の誤りのように必ず扱う必要がある失敗まで例外にすると、呼び出し側が `catch` を書き忘れても型のエラーにならず、扱い漏れに気付けません。戻り値で返せば、失敗の場合を扱わないと値を取り出せないため、型で扱い漏れを防げます。

**良い例**

```ts
type ParseResult = { ok: true; value: number } | { ok: false; message: string };

// 入力の誤りは想定内の失敗なので、戻り値で返す
export function parseQuantity(input: string): ParseResult {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1) {
    return { ok: false, message: "数量は1以上の整数で入力してください" };
  }
  return { ok: true, value };
}
```

**悪い例**

```ts
// 入力の誤りを例外にしている。呼び出し側がcatchを忘れても気付けない
export function parseQuantity(input: string): number {
  const value = Number(input);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("数量は1以上の整数で入力してください");
  }
  return value;
}
```

## 例外を握りつぶさない

`catch` したエラーは、対処するか、呼び出し元へ投げ直します。何もしない `catch` や、ログを出すだけで処理を続ける `catch` は書きません。

準拠レベル：**必須**

**理由**

エラーを握りつぶすと、処理が失敗したのに成功したように見えます。使う人は保存できていないことに気付かず、開発者も原因を追えません。失敗を無視してよいと判断した場合は、その理由をコメントに書きます。

空の `catch` は、Oxlintの `eslint/no-empty` で検出します。

**良い例**

```ts
try {
  await saveDraft(draft);
} catch (error) {
  throw new Error("下書きを保存できませんでした", { cause: error });
}
```

```ts
try {
  localStorage.setItem("sidebar", "collapsed");
} catch {
  // 表示の好みを覚えるだけなので、保存できなくても処理を続ける
}
```

**悪い例**

```ts
try {
  await saveDraft(draft);
} catch (error) {
  console.error(error);
  // 失敗したことを呼び出し元に伝えず、保存できたように進む
}
```

## catchは失敗に対処できる場所にだけ書く

`catch` は、失敗したときに何をするかを決められる場所（画面にエラーを表示する、別の方法で処理を続けるなど）にだけ書きます。それ以外の関数では `catch` せず、エラーをそのまま呼び出し元に伝えます。

準拠レベル：**推奨**

**理由**

すべての関数で `catch` すると、同じエラーが何度もログに出たり、途中でエラーの内容が書き換えられたりして、原因を追いにくくなります。対処する場所を、画面の単位や、イベントハンドラーなどの入口にまとめれば、エラーの扱いを一か所で確かめられます。

**良い例**

```ts
// データ取得の関数ではcatchしない
export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders");
  if (!response.ok) {
    throw new Error(`注文一覧を取得できませんでした（${response.status}）`);
  }
  return response.json();
}
```

```tsx
// 失敗したときの表示を決める画面でだけ扱う
export function OrderList() {
  const { data, isError, refetch } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  if (isError) {
    return <ErrorMessage message="注文一覧を表示できませんでした" onRetry={refetch} />;
  }
  // …
}
```

**悪い例**

```ts
export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await fetch("/api/orders");
    return await response.json();
  } catch {
    // 失敗を空の配列にすり替えている。画面は「注文がありません」と表示してしまう
    return [];
  }
}
```

## catchした値は型を確かめてから使う

`catch` で受け取った値は `unknown` 型として扱い、`instanceof` などで型を確かめてから使います。

準拠レベル：**必須**

**理由**

JavaScriptでは、`Error` 以外の値も `throw` できます。ライブラリが文字列やただのオブジェクトを `throw` することもあるため、受け取った値が `Error` だとは限りません。確かめずに `error.message` を読むと、`catch` の中で別のエラーが起きます。

TypeScriptの `strict` を有効にすると、`catch` の値は `unknown` 型になります（`useUnknownInCatchVariables`）。設定は[TypeScript](/coding-guidelines/tech/typescript/#コンパイラの厳しいチェックを有効にする)のページを参照してください。

**良い例**

```ts
try {
  await submitOrder(order);
} catch (error) {
  if (error instanceof OrderNotFoundError) {
    showMessage("注文が見つかりませんでした");
    return;
  }
  throw error;
}
```

**悪い例**

```ts
try {
  await submitOrder(order);
} catch (error: any) {
  // errorがErrorでなければ、ここで別のエラーになる
  showMessage(error.message);
}
```

## 投げ直すときは元のエラーをcauseに渡す

エラーを別のエラーに包んで投げ直すときは、元のエラーを `cause` オプションに渡します。

準拠レベル：**推奨**

**理由**

元のエラーを捨てて新しいエラーだけを投げると、本当の原因（通信のエラー、ライブラリの内部のエラーなど）とそのスタックトレースが失われます。`cause` に渡しておけば、何をしようとして失敗したのかと、なぜ失敗したのかの両方を追えます。

**良い例**

```ts
try {
  return JSON.parse(text);
} catch (error) {
  throw new Error("設定ファイルを読み込めませんでした", { cause: error });
}
```

**悪い例**

```ts
try {
  return JSON.parse(text);
} catch {
  // 元のエラーの内容と場所が失われる
  throw new Error("設定ファイルを読み込めませんでした");
}
```

## Promiseは必ずawaitするかcatchする

Promiseを返す関数を呼ぶときは、`await` するか、`.catch()` で失敗を扱います。呼んだまま放っておきません。

準拠レベル：**必須**

**理由**

`await` も `.catch()` もしていないPromiseが失敗すると、どの `try` / `catch` にも捕まらず、画面には何も表示されません。処理の順番も保証されないため、保存が終わる前に画面を移動する、といった不具合も起きます。結果を待つ必要がない場合も、失敗したときの扱いは書きます。

**良い例**

```ts
async function handleSubmit() {
  await saveOrder(order);
  navigate("/orders");
}
```

```ts
// 結果を待たなくてよい送信も、失敗の扱いは書く
sendAnalytics(event).catch((error) => {
  reportError(error);
});
```

**悪い例**

```ts
function handleSubmit() {
  // 保存の完了も失敗も待たずに画面を移動する
  saveOrder(order);
  navigate("/orders");
}
```

## fetchの結果はステータスを確かめてから使う

`fetch` の結果は、`response.ok` などでステータスを確かめてから使います。成功でなければ例外を `throw` します。

準拠レベル：**必須**

**理由**

`fetch` は、通信そのものが失敗したときだけ例外になります。サーバーが404や500を返しても、Promiseは成功として解決されます。ステータスを確かめずに `response.json()` を読むと、エラーの応答をデータとして扱ったり、JSONの解析で分かりにくいエラーになったりします。

データ取得のライブラリやAPIクライアントを使う場合も、ステータスの確認がライブラリの中で行われているかを確かめます。

**良い例**

```ts
const response = await fetch(`/api/orders/${orderId}`);
if (!response.ok) {
  throw new Error(`注文を取得できませんでした（${response.status}）`);
}
const order: unknown = await response.json();
```

**悪い例**

```ts
const response = await fetch(`/api/orders/${orderId}`);
// 404や500でも、エラーの本文をデータとして扱ってしまう
const order = await response.json();
```

## 外部から受け取ったデータは、実行時に形を確かめる

APIの応答、`localStorage` の値、URLのパラメータなど、プログラムの外から受け取ったデータは、使う前に実行時に形を確かめます。確かめるのは型ガードの関数か、スキーマで検証するライブラリで行います。

準拠レベル：**推奨**

**理由**

TypeScriptの型は、実行時には消えます。`as` で型を付けても、実際に届いたデータがその形である保証はありません。APIの仕様が変わった、古い形式の値が保存されている、といった場合に、データを受け取った場所ではなく、離れた場所で分かりにくいエラーになります。受け取った場所で確かめれば、失敗の原因がすぐに分かります。

**良い例**

```ts
function isOrder(value: unknown): value is Order {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "total" in value &&
    typeof value.total === "number"
  );
}

const data: unknown = await response.json();
if (!isOrder(data)) {
  throw new Error("注文のデータの形式が正しくありません");
}
```

**悪い例**

```ts
// 形を確かめずに型を付けている
const order = (await response.json()) as Order;
```

## 使う人に見せるエラーには、起きたことと次にできることを書く

画面に表示するエラーの文言には、何が起きたかと、使う人が次にできること（やり直す、入力を直す、問い合わせるなど）を書きます。エラーの内部の情報（例外のメッセージ、スタックトレース、ステータスコードだけの表示）は画面に出しません。

準拠レベル：**推奨**

**理由**

「エラーが発生しました」だけでは、使う人は何をすればよいか分かりません。一方、例外のメッセージやスタックトレースは、使う人には意味が分からず、内部の構造を外部に知らせることにもなります。詳しい情報はログやエラーの監視に送り、画面には使う人が判断に使える情報だけを出します。

**良い例**

```tsx
<ErrorMessage
  title="注文を確定できませんでした"
  description="通信が不安定な可能性があります。時間をおいて、もう一度お試しください。"
  onRetry={retry}
/>
```

**悪い例**

```tsx
<p>Error: TypeError: Cannot read properties of undefined (reading 'total')</p>
```

## 公開しているサービスのエラーは、監視の仕組みに送る

使う人がいるサービスでは、ブラウザで起きた想定外のエラーを、エラーを監視するサービスなどに送り、開発者が気付けるようにします。

準拠レベル：**推奨**

**理由**

ブラウザで起きたエラーは、使う人の画面の中で起きるため、送る仕組みがなければ開発者は気付けません。問い合わせが来るまで不具合が放置され、再現の手がかりも残りません。送る情報に秘密情報と個人情報を含めないことは、[セキュリティ](/coding-guidelines/quality/security/#ログやエラーの表示に秘密情報と個人情報を出さない)のページのとおりです。

**良い例**

```ts
// 画面ごとの境界で捕まえたエラーを、監視の仕組みに送る
export function reportError(error: unknown) {
  errorMonitor.captureException(error);
}
```

**悪い例**

```ts
export function reportError(error: unknown) {
  // 開発中のコンソールにしか出ず、公開後のエラーに気付けない
  console.error(error);
}
```
