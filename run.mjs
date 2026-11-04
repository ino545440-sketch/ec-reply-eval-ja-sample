import { readFile, writeFile } from 'node:fs/promises';
import { evaluateBatch } from './evaluator.mjs';
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
try {
  const cases = JSON.parse(await readFile(new URL('./cases.json', import.meta.url), 'utf8'));
  if (option('--template')) {
    await writeFile(option('--template'), JSON.stringify(cases.map(x => ({ id: x.id, output: null })), null, 2));
    console.log('空の回答ファイルを作成しました。正解は含めていません。');
  } else {
    if (!option('--input')) throw new Error('--input answers.json または --template answers.json を指定してください。');
    const responses = JSON.parse(await readFile(option('--input'), 'utf8'));
    if (!Array.isArray(responses)) throw new Error('回答ファイルは配列にしてください。');
    const report = evaluateBatch(cases, responses);
    if (option('--report')) await writeFile(option('--report'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ total: report.total, passed: report.passed, missing: report.missing.length, prose_review: report.prose_review }));
    process.exitCode = report.passed === report.total ? 0 : 1;
  }
} catch (e) { console.error(e.message); process.exitCode = 2; }
