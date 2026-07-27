"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const pageGroups = ["privacy", "terms", "preservation", "support"];
const requiredPages = pageGroups.flatMap((group) => [
  `${group}.html`,
  `${group}-zh.html`,
]);

function readPage(fileName) {
  return fs.readFileSync(path.join(root, fileName), "utf8");
}

assert.ok(
  fs.statSync(path.join(root, "styles.css")).size > 0,
  "styles.css must exist and be nonempty",
);

for (const page of requiredPages) {
  const html = readPage(page);
  const isChinese = page.endsWith("-zh.html");
  const counterpart = isChinese
    ? page.replace("-zh.html", ".html")
    : page.replace(".html", "-zh.html");

  assert.match(html, /<meta name="viewport"/, `${page}: viewport metadata`);
  assert.match(html, /<link rel="stylesheet" href="styles\.css"/, `${page}: shared stylesheet`);
  assert.match(html, /support@capsoul\.chat/, `${page}: support address`);
  assert.match(html, new RegExp(`href="${counterpart}"`), `${page}: reciprocal language link`);
  assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1, `${page}: exactly one h1`);
  assert.match(html, /<title>\s*\S[\s\S]*?<\/title>/, `${page}: nonempty title`);
  assert.match(html, /<main(?:\s[^>]*)?>/, `${page}: semantic main`);
  assert.match(html, /<nav[^>]+aria-label=/, `${page}: labeled navigation`);
  assert.match(
    html,
    isChinese ? /共享记忆胶囊/ : /shared memory capsule/i,
    `${page}: canonical shared-memory positioning`,
  );
  assert.doesNotMatch(
    html,
    /<script|<form|analytics|tracking|private key|BEGIN PRIVATE KEY/i,
    `${page}: prohibited executable, tracking, or secret content`,
  );

  for (const group of pageGroups) {
    const linkedPage = `${group}${isChinese ? "-zh" : ""}.html`;
    assert.match(html, new RegExp(`href="${linkedPage}"`), `${page}: links ${linkedPage}`);
  }
}

const preservationEnglish = readPage("preservation.html");
const preservationChinese = readPage("preservation-zh.html");
const preservationContract = [
  [/started UTC periods/i, /从发送时刻开始的 UTC 周期/],
  [/mixed preservation months and years/i, /封存月与封存年组合/],
  [/regardless of recipient count/i, /不因接收人数而增加/],
  [/sender.*pays/i, /仅发送方支付/],
  [/500 MB/i, /500 MB/],
  [/five recipients/i, /五位接收方/],
  [/24-hour release/i, /24 小时释放期/],
  [/withdrawal.*not return/i, /撤回.*不会退回/],
  [/same-kind balance debt/i, /同种额度欠额/],
  [/90-day claim window/i, /90 天认领窗口/],
  [/local-only.*recovery risk/i, /仅保存在本地.*恢复风险/],
  [/permanently free/i, /永久免费/],
  [/60 preservation months/i, /60 个封存月/],
  [/ten preservation years/i, /10 个封存年/],
  [/Offer Code/i, /Offer Code/],
  [/administrative grant/i, /后台人工发放/],
];

for (const [englishPattern, chinesePattern] of preservationContract) {
  assert.match(preservationEnglish, englishPattern);
  assert.match(preservationChinese, chinesePattern);
}

for (const page of ["privacy.html", "privacy-zh.html", "terms.html", "terms-zh.html"]) {
  const html = readPage(page);
  assert.match(html, /report|举报/i, `${page}: reporting policy`);
  assert.match(html, /block|屏蔽/i, `${page}: blocking policy`);
  assert.match(html, /180 days|180 天/i, `${page}: report retention`);
}

console.log(`Validated ${requiredPages.length} Capsoul legal pages.`);
