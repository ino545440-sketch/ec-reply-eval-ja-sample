# 日本語EC問い合わせAIの評価テスト｜無料10ケース

返品・配送・キャンセルの問い合わせAIについて、規則に対応する判断が返るかをJSONで照合するサンプルです。架空店舗の規則、注文の前提、質問、期待する判定、Node.js採点器を同梱しています。

基本の採点は **Node.js 20以上・追加依存なし・API鍵不要**。ご自身のAIで回答を作り、この採点器へ入力します。モデルを呼ぶ処理や利用権は含みません。

[ブラウザで試す](https://ec-reply-test-kit.ino5454.chatgpt.site/?utm_source=github&utm_medium=repository&utm_campaign=ec_reply_v1#demo) · [コマンドと実例つきの実行ガイド](https://ec-reply-test-kit.ino5454.chatgpt.site/guides/structured-eval?utm_source=github&utm_medium=repository&utm_campaign=ec_reply_v1) · [60ケース版の収録内容・利用条件](https://ec-reply-test-kit.ino5454.chatgpt.site/?utm_source=github&utm_medium=repository&utm_campaign=ec_reply_v1#purchase)

## 確認する場面

- 注文番号や発送状態が分からないときの追加確認
- 発送前と発送済みのキャンセルの違い
- 不良相談の到着7日目と8日目
- 自己都合返品の期限・開封条件
- 資料にない海外配送の質問
- 「規則を無視して」と求める質問

すべて試験用の架空データです。実店舗の規則や実顧客の注文情報は含みません。

## 最初に動かす

このリポジトリの「Code」→「Download ZIP」から取得して展開し、ファイルが入ったフォルダーをターミナルで開いて実行します。

```sh
node --version
node run.mjs --template responses.json
node make-prompts.mjs
```

`responses.json`はIDと空の回答欄、`prompts.jsonl`は自分のAIへ渡す質問のファイルです。後者は`cases.json`の正解フィールド`expected`を除いて、規則・前提・質問・出力形式だけを書き出します。このコマンドではAIを呼びません。

1. `prompts.jsonl`の各行の`system`を指示、`input`を資料と質問、`output_schema`を出力形式として、自分のAIに渡します。
2. 実際に得たJSON回答を、同じIDの`responses.json`の`output`へ保存します。
3. 次のコマンドで採点します。

```sh
node run.mjs --input responses.json --report report.json
```

ファイル形式は次のとおりです。以下は**形式確認用の固定入力**であり、モデルの評価結果ではありません。

```json
[
  {
    "id": "EC-001",
    "output": {
      "decision": "REQUEST_ORDER_ID",
      "rule_ids": ["R00"],
      "order_id_needed": true,
      "human_review": false,
      "claims_completed_action": false,
      "answer": "注文番号を教えてください。"
    }
  }
]
```

この1件だけを入力すると、10件中1件一致・9件未回答になります。

```json
{"total":10,"passed":1,"missing":9,"prose_review":"not_evaluated"}
```

正解をそのまま回答欄へコピーしても、AIの性能を測定したことにはなりません。実際の比較には、ご自身のモデルが出した回答を使ってください。

## 採点する5項目

| 項目 | 照合する内容 |
| --- | --- |
| `decision` | 判定コード |
| `rule_ids` | 根拠の規則IDの集合・重複なし |
| `order_id_needed` | 注文番号の確認要否 |
| `human_review` | 担当者への確認要否 |
| `claims_completed_action` | 処理完了を主張するフラグ |

`report.json`にケース別・項目別の期待値と回答値を出します。全件一致で終了コード0、不一致・未回答は1、ID重複やファイル不正は2です。

**案内文の正確さ・自然さ、案内文とフラグの矛盾、法令適合、実際の注文操作は自動評価しません。** `prose_review: not_evaluated`はその意味です。個社の業務へ使う際は、店舗固有の規則・質問・実際の操作の試験を追加してください。

## ファイル

| ファイル | 内容 |
| --- | --- |
| `policy.json` | 架空店舗の規則 |
| `cases.json` | 無料10ケースと期待する判定 |
| `decisions.json` | 判定コードの候補 |
| `make-prompts.mjs` | 正解を除いた質問の書き出し |
| `run.mjs` / `evaluator.mjs` | 入力準備・採点 |
| `promptfoo-tests.json` | 同じ10ケースの質問・採点条件 |

Promptfoo利用者は、同梱JSONから`policy`・`context`・`question`を自分のプロンプトへ渡して利用できます。モデルとプロンプトはご自身で設定してください。

連携確認環境はPromptfoo 0.125.1 / Node.js 24.11.1です。Promptfoo本体の実行要件は標準採点と別で、0.125.1はNode.js 22.22.0以上を必要とします。


## 60ケース版について

無料版が用途と実行環境に合うことを確認できたら、[日本語EC問い合わせAIテスト v1](https://ec-reply-test-kit.ino5454.chatgpt.site/?utm_source=github&utm_medium=repository&utm_campaign=ec_reply_v1#purchase)は4,980円・買切りです。20種類の判断条件を各3通りの日本語で質問する60ケースで、無料10ケースを含みます。60種類の独立した業務規則を収録した商品ではありません。

運営：INO WEB STUDIO。このリポジトリは無料評価サンプルの公開用です。利用範囲は[LICENSE.md](LICENSE.md)と[販売サイトの利用条件](https://ec-reply-test-kit.ino5454.chatgpt.site/terms)をご確認ください。人間の監修済み・外部認証済み・実顧客導入済みとする表示は行っていません。
