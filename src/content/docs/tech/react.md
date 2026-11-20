---
title: React
description: Reactの書き方。コンポーネント設計、Hooks、状態管理とデータ取得、パフォーマンスについて決めます。
---

Reactの書き方を、コンポーネント設計、Hooks、状態管理とデータ取得、パフォーマンスに分けて決めます。

JSXで書くマークアップは[HTML](/coding-guidelines/tech/html/)、スタイルは[CSS](/coding-guidelines/tech/css/)、型の書き方は[TypeScript](/coding-guidelines/tech/typescript/)のページに従います。アクセシビリティに関わるルールは[アクセシビリティ](/coding-guidelines/common/accessibility/)のページで扱います。コンポーネントのファイル名とディレクトリの分け方は、[命名規則](/coding-guidelines/common/naming/)と[ディレクトリ構成](/coding-guidelines/common/directory-structure/)を参照してください。

このページのルールのうち、Oxlintで検出できるものは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)で決めた設定に次の内容を加えて有効にします。Hooksのルール（`react/rules-of-hooks` と `react/exhaustive-deps`）は、フォーマットとLintのページの設定で有効にしています。

```json title=".oxlintrc.json（追加分）"
{
  "rules": {
    "react/prefer-function-component": "error",
    "react/no-unstable-nested-components": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "error",
    "react/no-danger": "error",
    "react/jsx-no-constructed-context-values": "error"
  }
}
```

## コンポーネント設計

### 関数コンポーネントで書く

コンポーネントは関数で書きます。クラスコンポーネントは使いません。

準拠レベル：**必須**

**理由**

Hooksは関数コンポーネントでしか使えず、Reactの新しい機能も関数コンポーネントを前提に作られています。クラスコンポーネントは、`this` の扱いやライフサイクルのメソッドに処理が分散し、ロジックを再利用しにくくなります。

クラスでしか書けないエラー境界（Error Boundary）は、[react-error-boundary](https://github.com/bvaughn/react-error-boundary)などのライブラリを使い、自分ではクラスを書きません。

このルールは、Oxlintの `react/prefer-function-component` で検出します。

**良い例**

```tsx
export function OrderSummary({ order }: OrderSummaryProps) {
  return <p>合計 {formatPrice(order.total)}</p>;
}
```

**悪い例**

```tsx
export class OrderSummary extends React.Component<OrderSummaryProps> {
  render() {
    return <p>合計 {formatPrice(this.props.order.total)}</p>;
  }
}
```

### コンポーネントの中でコンポーネントを定義しない

コンポーネントは、ファイルの最上位で定義します。コンポーネントの関数の中で、別のコンポーネントを定義しません。

準拠レベル：**必須**

**理由**

コンポーネントの中で定義したコンポーネントは、描画のたびに別のコンポーネントとして作り直されます。Reactは別物と判断して中身をすべて作り直すため、入力中の文字やフォーカスなどの状態が消え、表示も遅くなります。

このルールは、Oxlintの `react/no-unstable-nested-components` で検出します。

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

このルールは、Oxlintの `react/jsx-key` と `react/no-array-index-key` で検出します。

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

### dangerouslySetInnerHTMLを使わない

`dangerouslySetInnerHTML` は使いません。HTMLを表示する必要がある場合は、信頼できる方法で無害化したHTMLだけを渡し、理由をコメントに書きます。

準拠レベル：**必須**

**理由**

Reactは、JSXに埋め込んだ文字列を自動的にエスケープし、クロスサイトスクリプティング（XSS）を防いでいます。`dangerouslySetInnerHTML` はこの仕組みを外すため、利用者が入力した文字列などが混ざると、悪意のあるスクリプトが実行されます。

このルールは、Oxlintの `react/no-danger` で検出します。

**良い例**

```tsx
<p className={styles.message}>{review.comment}</p>
```

**悪い例**

```tsx
<p className={styles.message} dangerouslySetInnerHTML={{ __html: review.comment }} />
```

### 画面の一部で起きたエラーはError Boundaryで受け止める

描画中に起きたエラーは、Error Boundaryで受け止め、代わりの表示を出します。Error Boundaryは、アプリ全体を囲むものに加え、独立して失敗してよい単位（ページ、サイドバー、ウィジェットなど）にも置きます。

Error Boundaryは自分でクラスコンポーネントとして書かず、[react-error-boundary](https://github.com/bvaughn/react-error-boundary)を使います。

準拠レベル：**推奨**

**理由**

Reactでは、描画中にエラーが起きて、どこでも受け止められないと、アプリ全体の表示が消えて真っ白になります。Error Boundaryを置けば、エラーが起きた部分だけを代わりの表示に置き換え、ほかの部分は使い続けられます。

イベントハンドラーや非同期の処理の中で起きたエラーは、Error Boundaryでは受け止められません。それらは、その処理の中で扱います。

**良い例**

```tsx
import { ErrorBoundary } from "react-error-boundary";

export function DashboardPage() {
  return (
    <>
      <ErrorBoundary fallback={<WidgetError title="売上" />} onError={reportError}>
        <SalesWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={<WidgetError title="在庫" />} onError={reportError}>
        <StockWidget />
      </ErrorBoundary>
    </>
  );
}
```

**悪い例**

```tsx
// どちらかのウィジェットでエラーが起きると、ページ全体が表示されなくなる
export function DashboardPage() {
  return (
    <>
      <SalesWidget />
      <StockWidget />
    </>
  );
}
```

## Hooks

### Hooksはコンポーネントとカスタムフックの最上位で呼ぶ

Hooksは、コンポーネントかカスタムフックの最上位で呼びます。条件分岐、ループ、`return` の後、イベントハンドラーの中では呼びません。

準拠レベル：**必須**

**理由**

Reactは、Hooksが呼ばれた順番で、それぞれの状態を覚えています。条件によって呼ばれたり呼ばれなかったりすると、順番がずれ、別のHookの状態が渡されます。

このルールは、Oxlintの `react/rules-of-hooks` で検出します。

**良い例**

```tsx
export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order } = useOrder(orderId);
  const [isEditing, setIsEditing] = useState(false);

  if (!order) {
    return <Spinner />;
  }
  return <OrderView order={order} isEditing={isEditing} onEdit={() => setIsEditing(true)} />;
}
```

**悪い例**

```tsx
export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order } = useOrder(orderId);

  if (!order) {
    return <Spinner />;
  }
  const [isEditing, setIsEditing] = useState(false);
  return <OrderView order={order} isEditing={isEditing} onEdit={() => setIsEditing(true)} />;
}
```

### 依存配列には、中で使う値をすべて書く

`useEffect`、`useMemo`、`useCallback` の依存配列には、関数の中で使っているpropsやstateなどの値をすべて書きます。Lintの警告を消すために値を省きません。

準拠レベル：**必須**

**理由**

依存配列から値を省くと、その値が変わっても処理がやり直されず、古い値を使い続ける不具合になります。依存配列に入れると処理が多く走りすぎる場合は、値を省くのではなく、処理の作りを見直します。

このルールは、Oxlintの `react/exhaustive-deps` で検出します。

**良い例**

```tsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]);
```

**悪い例**

```tsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
  // oxlint-disable-next-line react/exhaustive-deps
}, []);
```

### propsやstateから計算できる値はstateにしない

propsや別のstateから計算できる値は、stateに持たず、描画の中で計算します。

準拠レベル：**推奨**

**理由**

計算できる値をstateに持つと、元の値が変わるたびに、`useEffect` などで同期させる必要があります。同期を忘れると表示が食い違い、同期させても、一度古い値で描画されてから描き直すため、無駄な描画が増えます。描画の中で計算すれば、常に元の値と一致します。計算が重い場合だけ、`useMemo` を使います。

`useEffect` の中でstateを更新していることは、Oxlintの `react/set-state-in-effect` で検出します。このルールは、[フォーマットとLint](/coding-guidelines/common/format-and-lint/)の設定で有効にしている `correctness` の分類に含まれています。

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

```ts title="use-media-query.ts"
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

## 状態管理とデータ取得

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

### stateは直接書き換えず、新しい値で置き換える

オブジェクトや配列のstateは、直接書き換えません。新しいオブジェクトや配列を作り、更新関数に渡します。

準拠レベル：**必須**

**理由**

Reactは、stateが新しい値に置き換わったかどうかで、描き直すかを判断します。オブジェクトや配列を直接書き換えても、同じものを指したままなので変化が検知されず、画面が更新されません。

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

### 前の値をもとにする更新には更新関数を渡す

前のstateをもとに次のstateを決めるときは、`setCount((current) => current + 1)` のように、更新関数に関数を渡します。

準拠レベル：**推奨**

**理由**

stateの更新は、すぐには反映されません。同じイベントの中で続けて更新したり、非同期の処理の後で更新したりすると、変数に残っている古い値をもとに計算してしまいます。関数を渡せば、Reactがその時点の最新の値を渡すため、更新が失われません。

**良い例**

```tsx
function handleAddTwo() {
  setQuantity((current) => current + 1);
  setQuantity((current) => current + 1);
}
```

**悪い例**

```tsx
function handleAddTwo() {
  // 2回呼んでも1しか増えない
  setQuantity(quantity + 1);
  setQuantity(quantity + 1);
}
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

### サーバーのデータはuseEffectで取得しない

サーバーから取得するデータは、[TanStack Query](https://tanstack.com/query/latest)などのデータ取得ライブラリで扱います。`useEffect` の中で `fetch` してstateに入れる書き方はしません。

準拠レベル：**推奨**

**理由**

`useEffect` でデータを取得すると、読み込み中とエラーの状態、古い応答が新しい応答を上書きする競合、キャッシュ、再取得などを、すべて自分で実装する必要があります。実装が漏れやすく、コンポーネントごとに書き方もばらつきます。専用の機能やライブラリを使えば、これらがそろった状態で使えます。

**良い例**

```tsx
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => fetchOrder(orderId),
  });
}
```

**悪い例**

```tsx
export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    fetchOrder(orderId).then(setOrder);
  }, [orderId]);

  return order;
}
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

### Contextに渡す値を描画のたびに作り直さない

Contextの `value` に、描画のたびに新しく作られるオブジェクトや関数を直接渡しません。頻繁に変わる値と、ほとんど変わらない値は、別のContextに分けます。

準拠レベル：**推奨**

**理由**

Contextの値が変わると、そのContextを使うすべてのコンポーネントが描き直されます。`value={{ user, logout }}` のように書くと、中身が同じでも描画のたびに別のオブジェクトになり、使う側がすべて描き直されます。React Compilerを使わない場合は、`useMemo` で値を保ちます。

このルールは、Oxlintの `react/jsx-no-constructed-context-values` で検出します。

**良い例**

```tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, logout: () => setUser(null) }), [user]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
```

**悪い例**

```tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  return <AuthContext value={{ user, logout: () => setUser(null) }}>{children}</AuthContext>;
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

### 数百件を超えるリストは仮想化する

一度に数百件を超える要素を並べるリストは、[TanStack Virtual](https://tanstack.com/virtual/latest)などで仮想化し、画面に見えている範囲の要素だけを描画します。件数を減らせる場合は、ページ分けを先に検討します。

準拠レベル：**推奨**

**理由**

要素の数が多いと、最初の描画と、更新のたびの描き直しに時間がかかり、スクロールや入力が引っかかるようになります。仮想化すれば、件数がいくら増えても、描画する要素の数は画面に入る分だけで済みます。

**良い例**

```tsx
const virtualizer = useVirtualizer({
  count: orders.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 48,
});

// 全体の高さと各行の位置を指定するスタイルは省略
return (
  <div ref={scrollRef} className={styles.scroll}>
    <ul className={styles.list}>
      {virtualizer.getVirtualItems().map((row) => {
        const order = orders[row.index];
        return order ? <OrderRow key={order.id} order={order} start={row.start} /> : null;
      })}
    </ul>
  </div>
);
```

**悪い例**

```tsx
// 1万件の注文をすべて描画している
return (
  <ul>
    {orders.map((order) => (
      <OrderRow key={order.id} order={order} />
    ))}
  </ul>
);
```
