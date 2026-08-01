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
  [/Memory Months/i, /记忆月/],
  [/Consumable/i, /消耗型/],
  [/do not expire/i, /不会过期/],
  [/auto-renewable Memory Membership/i, /自动续期的记忆会员/],
  [/15 Memory Months immediately and at 11 monthly anniversaries/i, /立即发放 15 个记忆月.*之后 11 个每月纪念日/],
  [/180 Memory Months during the paid year/i, /付费年度内共 180 个记忆月/],
  [/three Personal Capsouls per UTC month/i, /每个 UTC 月最多创建三枚 Personal Capsoul/],
  [/10 capsules for each UTC month/i, /每个 UTC 月 10 枚/],
  [/15 capsules for each UTC month/i, /每个 UTC 月 15 枚/],
  [/does not roll over/i, /不会结转/],
  [/within[\s\S]{0,40}30 days/i, /30 天内/],
  [/50,000,000 bytes[\s\S]{0,20}\(decimal 50 MB\)/i, /50,000,000 字节（十进制 50 MB）/],
  [/AES-256-GCM/i, /AES-256-GCM/],
  [/excluded from cloud backup/i, /排除在云备份之外/],
  [/does[\s\S]{0,30}not[\s\S]{0,30}store the Personal payload or Personal media/i, /不会保存 Personal 正文或 Personal 媒体/],
  [/Export and import keep the package encrypted/i, /导出和导入均保持加密/],
  [/partial final calendar month.*rounds up/i, /最后不足一个完整日历月的部分.*按一个记忆月计算/],
  [/three months and 17 days.*four Memory Months/i, /三个月零 17 天.*四个记忆月/],
  [/exactly twelve calendar months.*12 Memory Months/i, /整整十二个日历月.*12 个记忆月/],
  [/no separate year unit/i, /没有单独的年额度/],
  [/regardless of recipient count/i, /不因接收人数而增加/],
  [/sender.*pays/i, /仅发送方支付/],
  [/500 MB/i, /500 MB/],
  [/five recipients/i, /五位接收方/],
  [/24-hour upload reservation/i, /24 小时上传预约/],
  [/incomplete.*releases.*reserved Memory Months/i, /未完成.*释放.*预留的记忆月/],
  [/withdrawal.*not return/i, /撤回.*不会退回/],
  [/Memory Month adjustment debt/i, /记忆月退款调整差额/],
  [/90-day claim window/i, /90 天认领窗口/],
  [/local \.capsoul document/i, /本地 \.capsoul 文档/],
  [/permanently free/i, /永久免费/],
  [/180 Memory Months/i, /180 个记忆月/],
  [/Memory Membership/i, /记忆会员/],
  [/paid up front for one year/i, /按一年预付/],
  [/does not cancel the Apple subscription/i, /不会取消 Apple 订阅/],
  [/direct WeChat Pay checkout/i, /微信支付直接结账/],
  [/does not configure an Apple Offer Code/i, /未配置 Apple Offer Code/],
  [/administrative grant/i, /后台人工发放/],
];

for (const [englishPattern, chinesePattern] of preservationContract) {
  assert.match(preservationEnglish, englishPattern);
  assert.match(preservationChinese, chinesePattern);
}

const privacyEnglish = readPage("privacy.html");
const privacyChinese = readPage("privacy-zh.html");
for (const [englishPattern, chinesePattern] of [
  [/Personal-capsule control data/i, /Personal 胶囊控制数据/],
  [/AES-256-GCM/i, /AES-256-GCM/],
  [/excluded from cloud backup/i, /排除在云备份之外/],
  [/not uploaded to CloudBase/i, /不会上传至 CloudBase/],
  [/If server-side deletion fails/i, /如果服务端删除失败/],
]) {
  assert.match(privacyEnglish, englishPattern);
  assert.match(privacyChinese, chinesePattern);
}

for (const page of [
  "preservation.html",
  "preservation-zh.html",
  "terms.html",
  "terms-zh.html",
  "support.html",
  "support-zh.html",
]) {
  const html = readPage(page);
  assert.doesNotMatch(
    html,
    /Preservation Years?|Preservation Months?|封存年|封存月|mixed interval|组合时间/i,
    `${page}: retired month/year product wording`,
  );
}

for (const page of ["privacy.html", "privacy-zh.html", "terms.html", "terms-zh.html"]) {
  const html = readPage(page);
  assert.match(html, /report|举报/i, `${page}: reporting policy`);
  assert.match(html, /block|屏蔽/i, `${page}: blocking policy`);
  assert.match(html, /180 days|180 天/i, `${page}: report retention`);
}

console.log(`Validated ${requiredPages.length} Capsoul legal pages.`);
