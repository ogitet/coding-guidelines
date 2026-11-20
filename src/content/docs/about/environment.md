---
title: 対応環境
description: 動作を保証するブラウザ、使ってよいWebの機能の基準、対応する画面サイズと操作方法。
---

ここでは、動作を保証する範囲を決めます。この範囲をどう確かめるかは[検証](/coding-guidelines/quality/verification/)に書きます。

プロジェクトの要件で対応範囲が指定されている場合は、そちらを優先します。

## 対応ブラウザ

次のブラウザの最新版で動作を保証します。

| ブラウザ | 環境 |
| :-- | :-- |
| Chrome | Windows、macOS、Android |
| Edge | Windows |
| Firefox | Windows、macOS |
| Safari | macOS、iOS、iPadOS |

## 使ってよいWebの機能

HTML、CSS、JavaScriptの機能は、[Baseline](https://web.dev/baseline)を基準に使ってよいかを判断します。Baselineは、主要なブラウザで使える状態になったWebの機能を示す指標です。

| Baselineの状態 | 扱い |
| :-- | :-- |
| Widely available（広く利用可能） | そのまま使ってよい |
| Newly available（新たに利用可能） | 使えない環境でも内容を見られ、操作できるなら使ってよい |
| Limited availability（限定的） | 使えない環境でも困らない、見た目の補強にだけ使ってよい |

## 画面サイズ

画面の幅が320pxから横幅いっぱいまでのすべての幅で、横にスクロールせず、表示が崩れずに読めるようにします。

## 操作方法

次のどの方法でも、すべての機能を使えるようにします。

- マウス
- タッチ操作
- キーボード
- スクリーンリーダーなどの支援技術

詳しくは[アクセシビリティ](/coding-guidelines/quality/accessibility/)を参照してください。
