---
title: テスト方針
description: 自動テスト（単体、コンポーネント、E2E、ビジュアルリグレッション）の範囲と書き方。Vitest、Testing Library、Playwrightを使います。
---

自動テストで何を確かめ、どう書くかを決めます。使うツールは次のとおりです。

| 種類 | ツール | 対象 |
| :-- | :-- | :-- |
| 単体テスト | [Vitest](https://vitest.dev/) | 関数、カスタムフック |
| コンポーネントテスト | Vitest、[Testing Library](https://testing-library.com/) | Reactコンポーネント |
| E2Eテスト | [Playwright](https://playwright.dev/) | ログインや購入など、主要な利用の流れ |
| ビジュアルリグレッションテスト | Playwright | 見た目の崩れ |

ブラウザやデバイスでの表示の確認、HTMLバリデータやaxeによる検査など、人が確かめる作業は[検証](/coding-guidelines/quality/verification/)のページで扱います。

## テストの種類は確かめたいことで選ぶ

計算や変換などのロジックは単体テスト、画面の表示と操作はコンポーネントテスト、ページをまたぐ主要な流れはE2Eテストで確かめます。同じことを複数の種類のテストで重ねて確かめません。

準拠レベル：**推奨**

**理由**

E2Eテストは、本物のブラウザで動くため安心感がありますが、実行に時間がかかり、通信やタイミングの影響で不安定にもなりがちです。ロジックの細かい条件の違いは、速くて安定した単体テストで網羅し、E2Eテストは「つながったときに動くか」を確かめる少数の流れに絞ります。

ロジックをコンポーネントの外の関数に切り出しておくと、単体テストで確かめやすくなります。

**良い例**

```ts title="calculate-shipping-fee.test.ts"
import { describe, expect, test } from "vitest";
import { calculateShippingFee } from "./calculate-shipping-fee";

describe("calculateShippingFee", () => {
  test("小計が5,000円未満なら送料は500円", () => {
    expect(calculateShippingFee(4999)).toBe(500);
  });

  test("小計が5,000円以上なら送料は無料", () => {
    expect(calculateShippingFee(5000)).toBe(0);
  });
});
```

**悪い例**

```ts title="e2e/shipping-fee.spec.ts"
// 送料の境界値の確認のためだけに、毎回ブラウザで商品をカートに入れている
test("小計が4,999円なら送料は500円", async ({ page }) => {
  await page.goto("/products/4999-yen-item");
  await page.getByRole("button", { name: "カートに入れる" }).click();
  await page.goto("/cart");
  await expect(page.getByText("送料 500円")).toBeVisible();
});
```

## ロジックを追加・変更したら、同じプルリクエストでテストを書く

関数やカスタムフック、コンポーネントの振る舞いを追加・変更したら、それを確かめるテストを同じプルリクエストに含めます。

準拠レベル：**推奨**

**理由**

テストを後回しにすると、書かれないまま残ることがほとんどです。変更と同じプルリクエストにテストがあれば、レビューする人は、どの条件で動くことを確かめたのかをテストから読み取れます。

見た目だけの変更や、設定ファイルの変更など、自動テストで確かめる意味が薄いものは対象外です。

**良い例**

```text
src/features/cart/
├── calculate-shipping-fee.ts
└── calculate-shipping-fee.test.ts   ← 実装と同じプルリクエストで追加
```

**悪い例**

```md
<!-- プルリクエストの説明 -->
送料の計算を変更しました。テストは別のプルリクエストで追加します。
```

## 不具合を直すときは、再現するテストを先に書く

不具合を直すときは、まずその不具合で失敗するテストを書き、失敗することを確かめてから修正します。

準拠レベル：**推奨**

**理由**

先にテストが失敗することを確かめておけば、そのテストが本当に不具合を捉えていることと、修正で直ったことの両方を示せます。テストが残るので、同じ不具合が再発したときにも気づけます。

**良い例**

```ts
// 不具合：小計がちょうど5,000円のときに送料がかかっていた
test("小計がちょうど5,000円なら送料は無料", () => {
  expect(calculateShippingFee(5000)).toBe(0);
});
```

**悪い例**

```diff
// 不等号を直しただけで、テストは追加していない
- if (subtotal > FREE_SHIPPING_THRESHOLD) {
+ if (subtotal >= FREE_SHIPPING_THRESHOLD) {
```

## 実装の詳細ではなく、振る舞いをテストする

テストでは、使う人から見える結果（画面に表示されるもの、関数の戻り値）を確かめます。コンポーネントの内部の状態や、どの関数が何回呼ばれたかといった、実装の詳細は確かめません。

準拠レベル：**推奨**

**理由**

実装の詳細を確かめるテストは、振る舞いを変えないリファクタリングでも失敗します。そのたびにテストを直すことになり、テストが変更の邪魔になります。逆に、振る舞いを確かめるテストなら、実装を書き換えても、テストが通れば振る舞いが保たれていると判断できます。

コンポーネントの出力をまるごと保存するスナップショットテストも、意図しない差分が出やすく、何を確かめたいのかが読み取れないため使いません。

**良い例**

```tsx
test("数量を増やすと小計が更新される", async () => {
  const user = userEvent.setup();
  render(<CartItem price={1200} />);

  await user.click(screen.getByRole("button", { name: "数量を1増やす" }));

  expect(screen.getByText("小計 2,400円")).toBeInTheDocument();
});
```

**悪い例**

```tsx
test("数量を増やすとsetQuantityが呼ばれる", async () => {
  const setQuantity = vi.fn();
  vi.spyOn(React, "useState").mockReturnValue([1, setQuantity]);
  const { container } = render(<CartItem price={1200} />);

  await userEvent.click(container.querySelector(".increment-button")!);

  expect(setQuantity).toHaveBeenCalledWith(2);
  expect(container).toMatchSnapshot();
});
```

## 要素はロールとアクセシブルな名前で取得する

テストで要素を取得するときは、`getByRole` などで、ロール（ボタン、リンク、見出しなど）とアクセシブルな名前を指定します。クラス名やDOMの構造では取得しません。ロールで取得できない場合に限り、ラベルの文言や `data-testid` を使います。

準拠レベル：**推奨**

**理由**

使う人も支援技術も、要素をクラス名ではなく、役割と名前で見分けています。テストも同じ方法で要素を探せば、見た目のための変更でテストが壊れず、要素に正しい役割と名前が付いていることも同時に確かめられます。

Playwrightでも、`page.getByRole` で同じように取得します。

**良い例**

```tsx
screen.getByRole("button", { name: "カートに入れる" });
screen.getByRole("heading", { level: 1, name: "注文履歴" });
screen.getByLabelText("メールアドレス");
```

```ts
await page.getByRole("link", { name: "注文履歴" }).click();
```

**悪い例**

```tsx
container.querySelector(".product-card > div:nth-child(2) button");
screen.getByTestId("submit-button");
```

```ts
await page.locator("#header .nav li:nth-child(3) a").click();
```

## 操作はuser-eventで再現する

コンポーネントテストでのクリックや入力は、`@testing-library/user-event` で再現します。`fireEvent` は使いません。

準拠レベル：**推奨**

**理由**

実際のクリックでは、フォーカスの移動、`pointerdown`、`mouseup`、`click` など、複数のイベントが順に起きます。`fireEvent` は指定した1つのイベントしか発生させないため、実際には操作できない状態（無効なボタンなど）でも操作できてしまうことがあります。user-eventは、実際の操作に近い一連のイベントを発生させます。

**良い例**

```tsx
const user = userEvent.setup();
render(<SearchForm />);

await user.type(screen.getByRole("searchbox", { name: "キーワード" }), "コーヒー");
await user.click(screen.getByRole("button", { name: "検索" }));
```

**悪い例**

```tsx
render(<SearchForm />);

fireEvent.change(screen.getByRole("searchbox"), { target: { value: "コーヒー" } });
fireEvent.click(screen.getByText("検索"));
```

## テスト名には条件と期待する結果を書く

テスト名は日本語で、「〜のとき、〜になる」のように、条件と期待する結果が分かるように書きます。

準拠レベル：**推奨**

**理由**

テストが失敗したとき、最初に目にするのはテスト名です。条件と結果が書いてあれば、テストのコードを読まなくても、どの振る舞いが壊れたのかが分かります。テスト名を並べると、そのまま仕様の一覧として読めます。

**良い例**

```ts
describe("LoginForm", () => {
  test("メールアドレスが空のとき、送信するとエラーを表示する", async () => {});
  test("ログインに成功したとき、マイページに移動する", async () => {});
});
```

**悪い例**

```ts
describe("LoginForm", () => {
  test("test1", async () => {});
  test("submit", async () => {});
});
```

## 1つのテストでは1つの振る舞いを確かめる

1つのテストでは、1つの条件での1つの振る舞いだけを確かめます。準備、操作、確認の順に書き、操作と確認を何度も繰り返しません。

準拠レベル：**推奨**

**理由**

複数の振る舞いを1つのテストにまとめると、途中で失敗したときに、それより後の振る舞いが確かめられなくなります。どの振る舞いが壊れたのかも、テスト名から分かりません。

**良い例**

```tsx
test("在庫が0のとき、カートに入れるボタンを無効にする", () => {
  render(<ProductCard stock={0} />);

  expect(screen.getByRole("button", { name: "カートに入れる" })).toBeDisabled();
});

test("在庫が0のとき、在庫切れと表示する", () => {
  render(<ProductCard stock={0} />);

  expect(screen.getByText("在庫切れ")).toBeInTheDocument();
});
```

**悪い例**

```tsx
test("ProductCardの動作", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<ProductCard stock={3} />);
  await user.click(screen.getByRole("button", { name: "カートに入れる" }));
  expect(screen.getByText("カートに追加しました")).toBeInTheDocument();

  rerender(<ProductCard stock={0} />);
  expect(screen.getByRole("button", { name: "カートに入れる" })).toBeDisabled();
  expect(screen.getByText("在庫切れ")).toBeInTheDocument();
});
```

## テスト同士を独立させる

各テストは、ほかのテストの結果や実行順に依存しないようにします。テストの中で変えた状態（モック、タイマー、グローバルな値、保存したデータなど）は、テストごとに元に戻します。

準拠レベル：**必須**

**理由**

前のテストが残した状態に依存すると、単独で実行したときや、並列で実行したとき、順番が変わったときだけ失敗する、原因の分かりにくいテストになります。

Vitestでは、設定の `restoreMocks` を有効にして、モックをテストごとに自動で元に戻します。

**良い例**

```ts title="vitest.config.ts"
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    restoreMocks: true,
  },
});
```

```ts
test("ログイン済みのとき、ユーザー名を表示する", () => {
  render(<Header user={createUser({ name: "山田" })} />);
  expect(screen.getByText("山田さん")).toBeInTheDocument();
});
```

**悪い例**

```ts
let currentUser: User;

test("ログインする", async () => {
  currentUser = await login("yamada@example.com", "password");
});

// 前のテストが成功していないと動かない
test("ログイン済みのとき、ユーザー名を表示する", () => {
  render(<Header user={currentUser} />);
  expect(screen.getByText("山田さん")).toBeInTheDocument();
});
```

## テストから本物の外部APIを呼ばない

単体テストとコンポーネントテストでは、APIとの通信をモックし、決まった応答を返すようにします。E2Eテストでも、決済や外部サービスなど、テスト用の環境がないAPIは呼びません。

準拠レベル：**必須**

**理由**

本物のAPIを呼ぶと、ネットワークや相手のサーバーの状態でテストの結果が変わり、実行も遅くなります。本番のデータを書き換えたり、決済が発生したりする危険もあります。応答を固定すれば、エラーや空の応答など、本物では起こしにくい状態も確かめられます。

**良い例**

```tsx
test("注文が0件のとき、注文がないことを表示する", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([]));

  render(<OrderHistory />);

  expect(await screen.findByText("注文はまだありません")).toBeInTheDocument();
});
```

```ts
test("決済に失敗したとき、エラーを表示する", async ({ page }) => {
  await page.route("**/api/payments", (route) =>
    route.fulfill({ status: 402, json: { message: "カードが利用できません" } }),
  );
  // …
});
```

**悪い例**

```tsx
test("注文履歴を表示する", async () => {
  // 本番のAPIを呼んでいる。データが変わるとテストが失敗する
  render(<OrderHistory apiBaseUrl="https://api.example.com" />);

  expect(await screen.findByText("注文番号 1024")).toBeInTheDocument();
});
```

## 日時や乱数は固定する

現在の日時や乱数など、実行するたびに変わる値に結果が左右されるテストでは、その値を固定します。

準拠レベル：**必須**

**理由**

値を固定しないと、月末や年末、日付が変わる時刻など、特定のときにだけ失敗するテストになります。失敗を再現できないため、原因を調べることもできません。

**良い例**

```ts
test("注文日が今日なら『今日』と表示する", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-01T10:00:00+09:00"));

  expect(formatOrderDate(new Date("2026-04-01T08:00:00+09:00"))).toBe("今日");

  vi.useRealTimers();
});
```

**悪い例**

```ts
test("注文日が今日なら『今日』と表示する", () => {
  // 0時をまたいで実行すると失敗する
  expect(formatOrderDate(new Date())).toBe("今日");
});
```

## 待つときは時間ではなく条件で待つ

非同期の処理を待つときは、「要素が表示されるまで」のように条件で待ちます。決まった時間だけ待つ処理は書きません。

準拠レベル：**必須**

**理由**

時間で待つと、実行する環境が遅いときには足りずに失敗し、速いときには無駄に待つことになります。条件で待てば、条件を満たした時点ですぐ次に進み、遅い環境でもタイムアウトまで待ち続けます。

Testing Libraryでは `findBy` や `waitFor`、Playwrightでは自動で待つ `expect` を使います。

**良い例**

```tsx
expect(await screen.findByText("保存しました")).toBeInTheDocument();
```

```ts
await expect(page.getByRole("status")).toHaveText("保存しました");
```

**悪い例**

```tsx
await new Promise((resolve) => setTimeout(resolve, 1000));
expect(screen.getByText("保存しました")).toBeInTheDocument();
```

```ts
await page.waitForTimeout(3000);
expect(await page.locator(".toast").textContent()).toBe("保存しました");
```

## 失敗するテストを無効にしてマージしない

テストはCIで実行し、1つでも失敗したらマージしません。失敗するテストを `skip` で無効にしたり、`only` で一部だけ実行する状態のままコミットしたりしません。

準拠レベル：**必須**

**理由**

失敗を無効にして通すと、テストが守っていた振る舞いが壊れたまま公開されます。`only` が残っていると、ほかのテストが実行されず、CIが通っても何も確かめていないことになります。

不安定なテストは、無効にするのではなく、原因（実行順への依存、時間で待つ処理など）を直します。PlaywrightではCIで `only` を禁止し、Vitestも既定でCIでは `only` を禁止します。

**良い例**

```ts title="playwright.config.ts"
import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
});
```

```json title="package.json（一部）"
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

**悪い例**

```ts
// CIで失敗するので、いったん無効にする
test.skip("在庫が0のとき、カートに入れるボタンを無効にする", () => {});

test.only("ログインに成功したとき、マイページに移動する", async () => {});
```

## カバレッジの数値を目標にしない

テストのカバレッジ（実行された行の割合）は、テストされていない箇所を見つけるために使います。カバレッジの数値そのものを目標にはしません。

準拠レベル：**推奨**

**理由**

カバレッジは、その行が実行されたことしか示さず、結果が正しいことを確かめたかどうかは分かりません。数値を目標にすると、確認のないテストや、重要でない箇所のテストで数値を上げることが目的になります。数値よりも、重要なロジックと、不具合が起きやすい条件（境界値、空、エラー）がテストされているかを見ます。

**良い例**

```md
<!-- プルリクエストの説明 -->
カバレッジを見て、割引の計算でクーポンが期限切れの場合がテストされていなかったため追加しました。
```

**悪い例**

```ts
// カバレッジを上げるためだけのテスト。結果を何も確かめていない
test("formatPriceを呼ぶ", () => {
  formatPrice(1000);
});
```

## ビジュアルリグレッションテストは崩れやすい箇所に絞る

見た目の崩れを検出するビジュアルリグレッションテストは、採用するかをプロジェクトごとに決めます。採用する場合は、主要なページと、多くの画面で使う共通のコンポーネントに絞って使います。

準拠レベル：**任意**

**理由**

ビジュアルリグレッションテストは、CSSの変更が思わぬ画面に影響したことを検出できます。一方で、文言や画像の差し替えなど、意図した変更でも失敗するため、対象を広げすぎると基準画像の更新に追われます。

Playwrightの `toHaveScreenshot` を使います。日時や広告など、実行ごとに変わる部分は `mask` で隠します。

**良い例**

```ts
test("トップページの見た目", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("top.png", {
    fullPage: true,
    mask: [page.getByRole("region", { name: "新着情報" })],
  });
});
```

**悪い例**

```ts
// すべての商品ページを撮影し、商品の情報が変わるたびに失敗する
for (const product of allProducts) {
  test(`${product.name}の見た目`, async ({ page }) => {
    await page.goto(`/products/${product.id}/`);
    await expect(page).toHaveScreenshot();
  });
}
```

## 基準画像はCIと同じ環境で作り、差分を見てから更新する

ビジュアルリグレッションテストの基準画像は、CIと同じOSとブラウザの環境で作ります。基準画像を更新するときは、差分の画像を見て、意図した変更であることを確かめてから更新します。

準拠レベル：**必須**

**理由**

フォントの描画などはOSによって異なるため、手元のmacOSで作った基準画像は、LinuxのCIでは一致しません。Playwrightの公式のDockerイメージを使えば、手元でもCIと同じ環境で撮影できます。

差分を見ずに更新すると、意図しない崩れまで正しい状態として登録してしまい、テストの意味がなくなります。

**良い例**

```sh
# イメージのバージョンは、package.json の @playwright/test と同じにする
docker run --rm --ipc=host -v "$(pwd)":/work -w /work \
  mcr.microsoft.com/playwright:v1.56.0-noble \
  npx playwright test --update-snapshots
```

**悪い例**

```sh
# 手元のmacOSで、差分を確かめずにすべて更新する
npx playwright test --update-snapshots
```
