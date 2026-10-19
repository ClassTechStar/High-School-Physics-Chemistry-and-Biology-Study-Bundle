/**
 * fix-no-options.mjs — T1: 为 70 道「答案为字母但无 options」的英语题补齐选项
 * 选项数组按 [A,B,C,D] 顺序存放，正确内容置于该题原有答案字母对应位置。
 * 可重复执行（幂等）：仅当题目缺少 options 时才写入。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ── 熔断保护（T0-4 / P1-9）───────────────────────────────────────────────
// 本脚本是一次性数据修复脚本，会重写 1MB 的 exam-bank.json。
// 修复目标已被 npm run verify 门禁固化；重跑会把已修好的数据改回错误状态
// （fix-phase-a-data 尤其会覆盖 PHY_2018_01 的已修答案键）。
// 不带 --apply 时只打印摘要，不写任何文件。详见 ./README.md
import { guard as __legacyGuard } from './legacy-guard.mjs';
if (!__legacyGuard('fix-no-options.mjs')) { /* dry-run：到此为止 */ } else {
const BANK = resolve(ROOT, '1.2/data/exam-bank.json');

// id -> [A, B, C, D]
const OPTIONS = {
  // ── 听力 2018 ──
  ENG_2018_81: ['Tea', 'Juice', 'Coffee', 'Water'],
  ENG_2018_82: ['In a hospital', 'In a restaurant', 'In a bookstore', 'In a bank'],
  ENG_2018_83: ['At 8:30', 'At 9:00', 'At 7:45', 'At 8:15'],
  ENG_2018_84: ['Rainy and cold', 'Windy', 'Cloudy', 'Sunny and warm'],
  ENG_2018_85: ['5 dollars', '10 dollars', '15 dollars', '20 dollars'],
  ENG_2018_86: ['Teacher and student', 'Mother and son', 'Doctor and patient', 'Friends'],
  ENG_2018_87: ['Go hiking with friends', 'Stay at home', 'Visit his grandparents', 'Prepare for an exam'],
  ENG_2018_88: ['She got up late', 'She missed the bus stop', 'The bus broke down on the way', 'There was too much traffic'],
  ENG_2018_89: ['Take some medicine', 'Stay in bed', 'Drink more water', 'See a doctor'],
  ENG_2018_90: ['He dislikes sports', 'He often works late', 'He has given up smoking', 'He is good at cooking'],
  ENG_2018_91: ['Boring and too long', 'Exciting', 'Moving', 'Funny'],
  ENG_2018_92: ['By bus', 'By taxi', 'By subway', 'By car'],
  ENG_2018_93: ['A travel plan', 'A school activity', 'A weekend arrangement', 'A birthday party'],
  ENG_2018_94: ['She will help the man', 'She disagrees with the man', 'She knows nothing about it', 'She thinks the man should ask the teacher'],
  // ── 阅读理解 2019（科技与教育）──
  ENG_2019_95: ['The history of online education', 'Technology has brought positive changes to education', 'Teachers refuse to use technology', 'Computers are too expensive for schools'],
  ENG_2019_96: ['The high cost of computers', 'The lack of teachers', 'The digital divide', 'The safety of online courses'],
  ENG_2019_97: ['obtain', 'avoid', 'control', 'mention'],
  ENG_2019_98: ['Online courses will replace schools', 'All students have Internet access', 'Technology causes the digital divide', 'Technology makes learning more flexible'],
  ENG_2019_99: ['Doubtful', 'Indifferent', 'Positive', 'Negative'],
  ENG_2019_100: ['giving examples', 'telling stories', 'describing a process', 'comparing two persons'],
  ENG_2019_101: ['are only for rich students', 'make education available to people everywhere', 'have replaced traditional classes', 'are less effective than teachers'],
  ENG_2019_102: ["Learning at one's own pace", 'Access to vast information', 'Education available everywhere', 'Lower cost of living'],
  ENG_2019_103: ['The Digital Divide', 'Online Courses Everywhere', 'Technology and Education', 'The Future of Schools'],
  ENG_2019_104: ['The difference in teaching methods', 'The gap between those with and without access to technology', 'The generation gap between teachers and students', 'The distance between cities and villages'],
  // ── 完形填空 2020-2021 ──
  ENG_2020_105: ['sad', 'angry', 'surprised', 'bored'],
  ENG_2020_106: ['because', 'so that', 'although', 'unless'],
  ENG_2020_107: ['express', 'hide', 'change', 'forget'],
  ENG_2020_108: ['or', 'but', 'so', 'for'],
  ENG_2020_109: ['energy', 'opinion', 'impression', 'passion'],
  ENG_2020_110: ['fascinating', 'boring', 'expensive', 'short'],
  ENG_2020_111: ['Because of', 'Despite', 'Instead of', 'In case of'],
  ENG_2020_112: ['not', 'never', 'a bit', 'no'],
  ENG_2020_113: ['measures', 'place', 'part', 'turns'],
  ENG_2020_114: ['stood', 'gave', 'looked', 'got'],
  ENG_2020_115: ['terribly', 'badly', 'reasonable', 'sadly'],
  ENG_2020_116: ['patient', 'generous', 'lazy', 'careful'],
  ENG_2020_117: ['when', 'which', 'that', 'where'],
  ENG_2020_118: ['a little', 'much', 'a few', 'little'],
  ENG_2020_119: ['of', 'for', 'to', 'with'],
  ENG_2020_120: ['I had reached', 'did I reach', 'I reached', 'had I reached'],
  ENG_2020_121: ['that', 'which', 'what', 'when'],
  ENG_2021_122: ['got', 'have got', 'have been', 'will be'],
  // ── 应用文/阅读 2018-2021 ──
  ENG_2018_157: ['At 5:00 pm', 'At 8:00 pm', 'At 6:00 pm', 'At 9:00 pm'],
  ENG_2018_158: ['100 dollars', '75 dollars', '125 dollars', '150 dollars'],
  ENG_2018_159: ['To attract visitors to a tourist attraction', 'To teach children about history', 'To sell tickets at a discount', 'To introduce a new museum'],
  ENG_2019_160: ['G101', 'G103', 'D205', 'G107'],
  ENG_2019_161: ['He dislikes modern life', 'He is a history teacher', 'He cares about traditional culture', 'He lives in the countryside'],
  ENG_2020_162: ['deserted', 'repaired', 'protected', 'discovered'],
  ENG_2020_163: ['Excited', 'Worried', 'Humorous', 'Indifferent'],
  ENG_2020_164: ['They are too expensive', 'Nobody likes them', 'Few young people are willing to learn them', 'They are against the law'],
  ENG_2020_165: ['Closing all craft workshops', 'Forgetting old traditions', 'Replacing crafts with machines', 'Protecting and passing down traditional crafts'],
  ENG_2021_166: ['Sports are harmful to students', 'Regular exercise benefits students in many ways', 'Students should study all day', 'Exercise takes too much time'],
  ENG_2021_167: ['get lower grades', 'have more free time', 'concentrate better in class', 'feel more tired'],
  ENG_2021_168: ['encourage students to exercise', 'introduce a new sport', 'describe a school day', 'sell exercise equipment'],
  ENG_2021_169: ['Making more friends', 'Saving more money', 'Getting taller', 'Reducing stress'],
  ENG_2021_170: ['Question—Answer', 'Opinion—Evidence—Conclusion', 'Time order', 'Cause—Effect'],
  // ── 听力 2024-2025 ──
  ENG_2024_177: ['She completely agrees', 'She has no idea', 'She disagrees', 'She is not sure'],
  ENG_2024_178: ['9:00', '10:00', '9:30', '10:30'],
  ENG_2024_179: ['Buy the book', 'Borrow it from the library', 'Lend the book to the man', 'Read it online'],
  ENG_2025_180: ['Excited', 'Nervous', 'Disappointed', 'Tired'],
  ENG_2025_181: ['Waiting for a bus', 'Cooking dinner', 'Watching a movie', 'Planning a trip'],
  ENG_2025_182: ['He lost his job', 'He failed the exam', 'He has passed the driving test', 'He will move to a new city'],
  // ── 阅读理解 2025-2026（垃圾分类）──
  ENG_2025_183: ['The history of garbage', 'How and why we should sort waste', 'The cost of recycling', 'A trip to a recycling plant'],
  ENG_2025_184: ['Two', 'Three', 'Four', 'Five'],
  ENG_2025_185: ['Reducing pollution and saving resources', 'Making the city more beautiful', 'Creating more jobs', 'Saving time'],
  ENG_2026_186: ['Negative', 'Supportive', 'Doubtful', 'Uncaring'],
  ENG_2026_187: ['necessary', 'useless', 'difficult', 'popular'],
  ENG_2026_188: ['Buy more garbage bags', 'Throw away old things', 'Burn the waste', 'Sort waste before throwing it away'],
  // ── 完形填空 2024-2025 ──
  ENG_2024_189: ['extremely', 'hardly', 'never', 'little'],
  ENG_2025_190: ['It', 'As', 'Which', 'What'],
};

const data = JSON.parse(readFileSync(BANK, 'utf8'));
let fixed = 0, missing = [];
for (const [subj, node] of Object.entries(data)) {
  if (subj === 'meta' || !node || typeof node !== 'object') continue;
  const list = node.questions || node.questions || [];
  for (const q of list) {
    const opts = OPTIONS[q.id];
    if (!opts) continue;
    if (Array.isArray(q.options)) continue; // 幂等
    const idx = q.answer.charCodeAt(0) - 65;
    if (!/^[A-Z]$/.test(q.answer) || idx < 0 || idx >= opts.length) {
      missing.push(`${q.id} answer=${q.answer}`);
      continue;
    }
    q.options = [...opts];
    fixed++;
  }
}
writeFileSync(BANK, JSON.stringify(data, null, 2) + '\n');
console.log(`已补齐 ${fixed} 题 options；异常: ${missing.length ? missing.join(', ') : '无'}`);
}
