---
title: React
description: Reactの書き方。コンポーネント設計、Hooks、状態管理、パフォーマンスについて決めます。
---

Reactの書き方を、コンポーネント設計、Hooks、状態管理、パフォーマンスに分けて決めます。

JSXで書くマークアップは[HTML](/coding-guidelines/tech/html/)、スタイルは[CSS](/coding-guidelines/tech/css/)、型の書き方は[TypeScript](/coding-guidelines/tech/typescript/)のページに従います。アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/quality/accessibility/)のページで扱います。コンポーネントのファイル名は、[命名規則](/coding-guidelines/common/naming/)を参照してください。

多くのルールは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めたOxlintの設定で検出します。

## コンポーネント設計

### コンポーネントの中でコンポーネントを定義しない

コンポーネントは、ファイルの最上位で定義します。コンポーネントの関数の中で、別のコンポーネントを定義しません。

準拠レベル：**必須**

**理由**

コンポーネントの中で定義したコンポーネントは、描画のたびに別のコンポーネントとして作り直されます。Reactは別物と判断して中身をすべて作り直すため、入力中の文字やフォーカスなどの状態が消え、表示も遅くなります。

**良い例**

```tsx
function OrderRow({ order }: OrderRowProps) {
  return <li>{order.id}</li>;
}

export function OrderList({ orders }: OrderListProps) {
  return (
    <ul>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  );
}
```

**悪い例**

```tsx
export function OrderList({ orders }: OrderListProps) {
  function OrderRow({ order }: OrderRowProps) {
    return <li>{order.id}</li>;
  }

  return (
    <ul>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </ul>
  );
}
```

### propsの型を定義し、引数で分割代入して受け取る

propsの型は、コンポーネントと同じファイルで `コンポーネント名 + Props` の名前で定義します。propsは、引数の位置で分割代入して受け取り、既定値もそこで指定します。

準拠レベル：**推奨**

**理由**

propsの型に名前を付けておくと、コンポーネントを包む別のコンポーネントや、テストからも同じ型を使えます。引数の位置で分割代入すれば、コンポーネントが受け取るpropsの一覧と既定値を、関数の1行目で読み取れます。

**良い例**

```tsx
type PriceProps = {
  amount: number;
  currency?: "JPY" | "USD";
};

export function Price({ amount, currency = "JPY" }: PriceProps) {
  return <span>{formatCurrency(amount, currency)}</span>;
}
```

**悪い例**

```tsx
export function Price(props: { amount: number; currency?: "JPY" | "USD" }) {
  const currency = props.currency || "JPY";
  return <span>{formatCurrency(props.amount, currency)}</span>;
}
```

### 中身を差し替える部品はchildrenで受け取る

カード、ダイアログ、レイアウトのように、枠は共通で中身が場面ごとに変わる部品は、中身を `children` で受け取ります。中身を組み立てるためのpropsを増やしません。

準拠レベル：**推奨**

**理由**

中身をpropsで細かく指定する作りにすると、新しい使い方が出るたびにpropsが増え、部品が複雑になります。`children` で受け取れば、部品は枠の役割だけを持ち、中身は使う側が自由に組み立てられます。使う側が持つデータを、部品を何階層も通して渡す必要もなくなります。

**良い例**

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
}

<Card title="お届け先">
  <AddressView address={address} />
  <EditAddressButton />
</Card>;
```

**悪い例**

```tsx
type CardProps = {
  title: string;
  address?: Address;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEdit?: () => void;
};

<Card title="お届け先" address={address} showEditButton onEdit={handleEdit} />;
```

### リストの要素には、データに固有のkeyを付ける

配列から要素を並べるときは、データのIDなど、要素ごとに固有で変わらない値を `key` に指定します。配列の添字や、描画のたびに変わる値は使いません。

準拠レベル：**必須**

**理由**

Reactは `key` で要素を見分け、追加・削除・並べ替えのときに、どの要素を残すかを決めます。添字を `key` にすると、並び順が変わったときに別の要素の状態（入力中の文字やチェックの状態など）が引き継がれます。`Math.random()` などを使うと、描画のたびにすべての要素が作り直されます。

**良い例**

```tsx
<ul>
  {items.map((item) => (
    <CartItemRow key={item.id} item={item} />
  ))}
</ul>
```

**悪い例**

```tsx
<ul>
  {items.map((item, index) => (
    <CartItemRow key={index} item={item} />
  ))}
</ul>
```

## Hooks

### propsやstateから計算できる値はstateにしない

propsや別のstateから計算できる値は、stateに持たず、描画の中で計算します。

準拠レベル：**推奨**

**理由**

計算できる値をstateに持つと、元の値が変わるたびに、`useEffect` などで同期させる必要があります。同期を忘れると表示が食い違い、同期させても、一度古い値で描画されてから描き直すため、無駄な描画が増えます。描画の中で計算すれば、常に元の値と一致します。計算が重い場合だけ、`useMemo` を使います。

**良い例**

```tsx
export function CartSummary({ items }: CartSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <p>合計 {formatPrice(total)}</p>;
}
```

**悪い例**

```tsx
export function CartSummary({ items }: CartSummaryProps) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [items]);

  return <p>合計 {formatPrice(total)}</p>;
}
```

### useEffectは外部との同期だけに使う

`useEffect` は、ブラウザのAPI、外部のライブラリ、通信の接続など、Reactの外にあるものと同期するためだけに使います。利用者の操作をきっかけにする処理は、イベントハンドラーに書きます。

準拠レベル：**推奨**

**理由**

「ボタンを押したら送信する」のような処理を、stateの変化を `useEffect` で監視して実行すると、何をきっかけに処理が動くのかを追いにくくなります。別の理由で同じstateが変わったときにも処理が動き、二重送信などの不具合につながります。イベントハンドラーに書けば、きっかけと処理が1か所にまとまります。

**良い例**

```tsx
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  submitOrder(cart);
  showToast("注文を受け付けました");
}
```

**悪い例**

```tsx
const [isSubmitted, setIsSubmitted] = useState(false);

useEffect(() => {
  if (isSubmitted) {
    submitOrder(cart);
    showToast("注文を受け付けました");
  }
}, [isSubmitted, cart]);
```

### useEffectで始めた処理は後片付けする

`useEffect` で、イベントの登録、タイマー、購読、通信などを始めたときは、それを止める関数を返します。

準拠レベル：**必須**

**理由**

後片付けをしないと、コンポーネントが消えた後もイベントやタイマーが動き続け、メモリを使い続けたり、存在しないコンポーネントのstateを更新しようとしたりします。開発時のStrict Modeでは、`useEffect` が2回実行されるため、後片付けの漏れは二重の登録として表に出ます。

**良い例**

```tsx
useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

**悪い例**

```tsx
useEffect(() => {
  window.addEventListener("resize", () => {
    setWidth(window.innerWidth);
  });
}, []);
```

### 繰り返し使うロジックはカスタムフックにまとめる

複数のコンポーネントで使う、Hooksを組み合わせたロジックは、カスタムフックにまとめます。カスタムフックの名前は `use` で始めます。

準拠レベル：**推奨**

**理由**

同じHooksの組み合わせを複数のコンポーネントにコピーすると、修正のたびにすべてを直す必要があります。カスタムフックにまとめれば、コンポーネントは「何をしたいか」だけを書けば済み、ロジックを単独でテストすることもできます。名前を `use` で始めるのは、Reactとツールが、Hooksのルールを当てはめる対象を名前で見分けるためです。

Hooksを使わない関数は、カスタムフックにせず、普通の関数にします。

**良い例**

```ts title="useMediaQuery.ts"
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
```

**悪い例**

```ts
// Hooksを使っていないのに use で始めている
export function useFormatPrice(price: number): string {
  return `${price.toLocaleString("ja-JP")}円`;
}
```

## 状態管理

### stateは使うコンポーネントの近くに置く

stateは、それを使うコンポーネントの中に置きます。複数のコンポーネントで共有する必要が出たときだけ、それらに共通する一番近い親へ移します。

準拠レベル：**推奨**

**理由**

stateを必要以上に上の階層やグローバルな場所に置くと、stateが変わるたびに関係のないコンポーネントまで描き直され、どこから変更されるのかも追いにくくなります。使う場所の近くに置けば、影響の範囲がそのコンポーネントの中に限られます。

**良い例**

```tsx
export function ProductCard({ product }: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // …
}
```

**悪い例**

```tsx
// アプリ全体で共有する必要のない開閉の状態を、最上位に置いている
export function App() {
  const [openProductDetailIds, setOpenProductDetailIds] = useState<string[]>([]);
  // …
}
```

### stateは新しい値で置き換え、前の値をもとにするときは更新関数を渡す

オブジェクトや配列のstateは、直接書き換えません。新しいオブジェクトや配列を作って渡します。前のstateをもとに次のstateを決めるときは、`setCount((current) => current + 1)` のように、更新関数に関数を渡します。

準拠レベル：**必須**

**理由**

Reactは、stateが新しい値に置き換わったかどうかで、描き直すかを判断します。オブジェクトや配列を直接書き換えても、同じものを指したままなので変化が検知されず、画面が更新されません。

また、stateの更新はすぐには反映されません。変数に残っている古い値をもとに計算すると、続けて更新したときに更新が失われます。関数を渡せば、Reactがその時点の最新の値を渡します。

**良い例**

```tsx
setCart((current) => ({
  ...current,
  items: current.items.filter((item) => item.id !== removedId),
}));
```

**悪い例**

```tsx
const index = cart.items.findIndex((item) => item.id === removedId);
cart.items.splice(index, 1);
setCart(cart);
```

### 同時に成り立たない状態を、別々のstateにしない

「読み込み中」「成功」「失敗」のように、同時には成り立たない状態は、複数の真偽値に分けず、1つのstateにユニオン型で持ちます。

準拠レベル：**推奨**

**理由**

`isLoading` と `isError` のように真偽値を分けると、両方が真になるなど、実際にはありえない組み合わせが作れてしまいます。更新するときに片方を戻し忘れると、その組み合わせが画面に出ます。1つのstateにまとめれば、ありえない状態を型の上で作れなくなります。

**良い例**

```tsx
type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; orderId: string }
  | { status: "error"; message: string };

const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
```

**悪い例**

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [orderId, setOrderId] = useState("");
```

### URLで表せる状態はURLに持つ

検索条件、絞り込み、並び順、ページ番号、表示しているタブなど、そのURLを開き直したときにも再現したい状態は、stateではなくURLのクエリパラメーターやパスに持ちます。

準拠レベル：**推奨**

**理由**

stateに持った状態は、ページを再読み込みしたり、URLを共有したりすると失われます。URLに持てば、ブラウザの戻る・進むでも状態が戻り、ブックマークや共有もできます。URLの読み書きには、使っているフレームワークやルーターの機能を使います。

**良い例**

```tsx
// /orders/?status=shipped&page=2（React Routerの場合）
const [searchParams] = useSearchParams();
const status = searchParams.get("status") ?? "all";
const page = Number(searchParams.get("page") ?? "1");
```

**悪い例**

```tsx
const [status, setStatus] = useState("all");
const [page, setPage] = useState(1);
```

## パフォーマンス

### メモ化は必要だと確かめてから使う

`useMemo`、`useCallback`、`memo` は、React Developer Toolsのプロファイラーなどで描画が遅いと確かめた箇所だけに使います。React Compilerを導入しているプロジェクトでは、自動でメモ化されるため、手では書きません。

準拠レベル：**推奨**

**理由**

メモ化には、依存配列を比べる処理と、値を覚えておくメモリが必要です。軽い処理に使っても速くはならず、依存配列の書き漏れによる不具合の原因が増えるだけです。描画が遅い原因の多くは、stateの置き場所やコンポーネントの分け方にあるため、まずはそちらを見直します。

**良い例**

```tsx
export function OrderTable({ orders, keyword }: OrderTableProps) {
  // プロファイラーで、数千件の絞り込みが遅いことを確かめたため
  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesKeyword(order, keyword)),
    [orders, keyword],
  );
  // …
}
```

**悪い例**

```tsx
export function OrderTitle({ order }: OrderTitleProps) {
  const title = useMemo(() => `注文番号 ${order.id}`, [order.id]);
  const handleClick = useCallback(() => {
    console.log(order.id);
  }, [order.id]);
  // …
}
```

### 最初の表示に要らないコンポーネントは遅延読み込みする

ダイアログ、グラフ、リッチテキストエディタなど、最初の表示では使わず、コードの大きいコンポーネントは、`lazy` と動的な `import()` で、必要になったときに読み込みます。

準拠レベル：**推奨**

**理由**

すべてのコンポーネントを最初に読み込むと、JavaScriptが大きくなり、ページが操作できるようになるまでの時間が延びます。使われるか分からない大きなコンポーネントを後から読み込めば、最初の表示を速くできます。

**良い例**

```tsx
const SalesChart = lazy(() =>
  import("@/features/sales/SalesChart").then((module) => ({ default: module.SalesChart })),
);

export function SalesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SalesChart />
    </Suspense>
  );
}
```

**悪い例**

```tsx
// 画面の下のほうにしか出ないグラフを、最初から読み込んでいる
import { SalesChart } from "@/features/sales/SalesChart";

export function SalesPage() {
  return <SalesChart />;
}
```
