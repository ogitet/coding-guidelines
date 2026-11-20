---
title: テスト
description: 自動テスト（単体テストとE2Eテスト）の範囲と書き方。VitestとPlaywrightを使います。
---

自動テストで何を確かめ、どう書くかを決めます。使うツールは次のとおりです。

| 種類 | ツール | 対象 |
| :-- | :-- | :-- |
| 単体テスト | [Vitest](https://vitest.dev/) | 計算や変換などのロジック |
| E2Eテスト | [Playwright](https://playwright.dev/) | 画面の表示と操作 |

ブラウザやデバイスでの表示の確認、HTMLバリデータやaxeによる検査など、人が確かめる作業は[検証](/coding-guidelines/quality/verification/)のページで扱います。

## テストの種類は確かめたいことで選ぶ

計算や変換などのロジックは単体テスト、画面の表示と操作はE2Eテストで確かめます。同じことを複数の種類のテストで重ねて確かめません。

準拠レベル：**推奨**

**理由**

E2Eテストは、本物のブラウザで動くため安心感がありますが、実行に時間がかかり、通信やタイミングの影響で不安定にもなりがちです。ロジックの細かい条件の違いは、速くて安定した単体テストで網羅し、E2Eテストは画面の操作の流れを確かめることに絞ります。

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

## 変更にはテストを付け、不具合の修正は再現するテストから始める

ロジックや画面の振る舞いを追加・変更したら、それを確かめるテストを同じプルリクエストに含めます。不具合を直すときは、まずその不具合で失敗するテストを書き、失敗することを確かめてから修正します。

準拠レベル：**推奨**

**理由**

テストを後回しにすると、書かれないまま残ることがほとんどです。変更と同じプルリクエストにテストがあれば、レビューする人は、どの条件で動くことを確かめたのかをテストから読み取れます。不具合の修正では、先にテストが失敗することを確かめておけば、そのテストが本当に不具合を捉えていることと、修正で直ったことの両方を示せます。

見た目だけの変更や、設定ファイルの変更など、自動テストで確かめる意味が薄いものは対象外です。

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

テストでは、使う人から見える結果（画面に表示されるもの、関数の戻り値）を確かめます。内部の状態や、どの関数が何回呼ばれたかといった、実装の詳細は確かめません。

準拠レベル：**推奨**

**理由**

実装の詳細を確かめるテストは、振る舞いを変えないリファクタリングでも失敗します。そのたびにテストを直すことになり、テストが変更の邪魔になります。逆に、振る舞いを確かめるテストなら、実装を書き換えても、テストが通れば振る舞いが保たれていると判断できます。

**良い例**

```ts
test("数量を増やすと小計が更新される", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("button", { name: "数量を1増やす" }).click();
  await expect(page.getByText("小計 2,400円")).toBeVisible();
});
```

**悪い例**

```ts
test("数量を増やすと保存した数量が2になる", async ({ page }) => {
  await page.goto("/cart");
  await page.getByRole("button", { name: "数量を1増やす" }).click();
  // 画面ではなく、内部に保存した値を確かめている
  const cart = await page.evaluate(() => localStorage.getItem("cart"));
  expect(JSON.parse(cart ?? "{}").quantity).toBe(2);
});
```

## 要素はロールとアクセシブルな名前で取得する

テストで要素を取得するときは、`getByRole` などで、ロール（ボタン、リンク、見出しなど）とアクセシブルな名前を指定します。クラス名やDOMの構造では取得しません。ロールで取得できない場合に限り、ラベルの文言や `data-testid` を使います。

準拠レベル：**推奨**

**理由**

使う人も支援技術も、要素をクラス名ではなく、役割と名前で見分けています。テストも同じ方法で要素を探せば、見た目のための変更でテストが壊れず、要素に正しい役割と名前が付いていることも同時に確かめられます。CSS Modulesのクラス名は実行時に変わるため、そもそもテストで使えません。

**良い例**

```ts
await page.getByRole("link", { name: "注文履歴" }).click();
await expect(page.getByRole("heading", { level: 1, name: "注文履歴" })).toBeVisible();
await page.getByLabel("メールアドレス").fill("user@example.com");
```

**悪い例**

```ts
await page.locator("#header .nav li:nth-child(3) a").click();
await page.getByTestId("submit-button").click();
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

## テスト同士を独立させる

各テストは、ほかのテストの結果や実行順に依存しないようにします。テストの中で変えた状態（モック、タイマー、グローバルな値、保存したデータなど）は、テストごとに元に戻します。

準拠レベル：**必須**

**理由**

前のテストが残した状態に依存すると、単独で実行したときや、並列で実行したとき、順番が変わったときだけ失敗する、原因の分かりにくいテストになります。

**良い例**

```ts
test("商品を追加すると、カートの件数が1になる", () => {
  const cart = addItem(createCart(), item);
  expect(cart.items).toHaveLength(1);
});
```

**悪い例**

```ts
const cart = createCart();

test("商品を追加する", () => {
  cart.items.push(item);
});

// 前のテストが実行されていないと失敗する
test("カートの件数が1になる", () => {
  expect(cart.items).toHaveLength(1);
});
```

## テストから本物の外部APIを呼ばない

単体テストでは、APIとの通信をモックし、決まった応答を返すようにします。E2Eテストでも、決済や外部サービスなど、テスト用の環境がないAPIは呼びません。

準拠レベル：**必須**

**理由**

本物のAPIを呼ぶと、ネットワークや相手のサーバーの状態でテストの結果が変わり、実行も遅くなります。本番のデータを書き換えたり、決済が発生したりする危険もあります。応答を固定すれば、エラーや空の応答など、本物では起こしにくい状態も確かめられます。

**良い例**

```ts
test("注文が0件のとき、空の配列を返す", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json([]));
  expect(await fetchOrders()).toEqual([]);
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

```ts
test("注文履歴を取得する", async () => {
  // 本番のAPIを呼んでいる。データが変わるとテストが失敗する
  const orders = await fetchOrders("https://api.example.com");
  expect(orders[0]?.id).toBe("1024");
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

時間で待つと、実行する環境が遅いときには足りずに失敗し、速いときには無駄に待つことになります。条件で待てば、条件を満たした時点ですぐ次に進み、遅い環境でもタイムアウトまで待ち続けます。Playwrightでは、条件を満たすまで自動で待つ `expect` を使います。

**良い例**

```ts
await expect(page.getByRole("status")).toHaveText("保存しました");
```

**悪い例**

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
