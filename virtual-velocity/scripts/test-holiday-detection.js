#!/usr/bin/env node
// Tests for holiday detection logic.
// Run from virtual-velocity/: node scripts/test-holiday-detection.js
// The cny table covers 2024–2040; years outside that range (e.g. 2023) are
// intentionally absent — tests confirm those return null.

// ── Paste the detection functions here for isolated testing ──────────────────

var cny = {
  2024:[2,10], 2025:[1,29], 2026:[2,17], 2027:[2,6],  2028:[1,26],
  2029:[2,13], 2030:[2,3],  2031:[1,23], 2032:[2,11], 2033:[1,31],
  2034:[2,19], 2035:[2,8],  2036:[1,28], 2037:[2,15], 2038:[2,4],
  2039:[1,24], 2040:[2,12]
};

function nthMonday(year, month, n) {
  var date = new Date(year, month - 1, 1);
  var dow = date.getDay();
  var firstMonday = 1 + ((8 - dow) % 7);
  return firstMonday + (n - 1) * 7;
}

function inWindow(y, m, d, wy, wm, wd, days) {
  function toInt(yy, mm, dd) { return yy * 10000 + mm * 100 + dd; }
  var target = new Date(wy, wm - 1, wd);
  var lo = new Date(target); lo.setDate(target.getDate() - days);
  var hi = new Date(target); hi.setDate(target.getDate() + days);
  var check = toInt(y, m, d);
  return check >= toInt(lo.getFullYear(), lo.getMonth()+1, lo.getDate())
      && check <= toInt(hi.getFullYear(), hi.getMonth()+1, hi.getDate());
}

function detect(y, m, d) {
  // Christmas: Dec 11 – Jan 1 (asymmetric: 14 days before Dec 25, 7 days after)
  if ((m === 12 && d >= 11) || (m === 1 && d === 1)) return 'christmas';
  var mlk  = nthMonday(y, 1, 3);
  var cnyd = cny[y];
  if (inWindow(y,m,d, y,10,31, 4))                          return 'halloween';
  if (cnyd && inWindow(y,m,d, y,cnyd[0],cnyd[1], 3))        return 'chinese-new-year';
  if (inWindow(y,m,d, y,2,14,  7))                          return 'valentines';
  if (inWindow(y,m,d, y,3,17,  7))                          return 'st-patricks';
  if (inWindow(y,m,d, y,7,4,   7))                          return 'july-4th';
  if (inWindow(y,m,d, y,1,mlk, 3))                          return 'mlk';
  if (inWindow(y,m,d, y,11,11, 7))                          return 'veterans';
  return null;
}

// ── Test harness ─────────────────────────────────────────────────────────────

var passed = 0, failed = 0;

function expect(label, result, expected) {
  if (result === expected) {
    console.log('  ✓ ' + label);
    passed++;
  } else {
    console.error('  ✗ ' + label + ' — got ' + JSON.stringify(result) + ', expected ' + JSON.stringify(expected));
    failed++;
  }
}

// ── nthMonday ────────────────────────────────────────────────────────────────
console.log('\nnthMonday:');
// Jan 2026: starts Thursday (dow=4). First Monday = 5. 3rd Monday = 19.
expect('MLK 2026 = Jan 19', nthMonday(2026, 1, 3), 19);
// Jan 2025: starts Wednesday (dow=3). First Monday = 6. 3rd Monday = 20.
expect('MLK 2025 = Jan 20', nthMonday(2025, 1, 3), 20);
// Jan 2024: starts Monday (dow=1). First Monday = 1. 3rd Monday = 15.
expect('MLK 2024 = Jan 15', nthMonday(2024, 1, 3), 15);

// ── Christmas ────────────────────────────────────────────────────────────────
console.log('\nChristmas (Dec 11 – Jan 1):');
expect('Dec 11 = christmas',  detect(2025, 12, 11), 'christmas');
expect('Dec 25 = christmas',  detect(2025, 12, 25), 'christmas');
expect('Dec 31 = christmas',  detect(2025, 12, 31), 'christmas');
expect('Jan 1  = christmas',  detect(2026, 1,  1),  'christmas');
expect('Jan 2  = null',       detect(2026, 1,  2),  null);
expect('Dec 10 = null',       detect(2025, 12, 10), null);

// ── Halloween ────────────────────────────────────────────────────────────────
console.log('\nHalloween (Oct 27 – Nov 4):');
expect('Oct 27 = halloween',  detect(2025, 10, 27), 'halloween');
expect('Oct 31 = halloween',  detect(2025, 10, 31), 'halloween');
expect('Nov 4  = halloween',  detect(2025, 11, 4),  'halloween');
expect('Oct 26 = null',       detect(2025, 10, 26), null);
expect('Nov 26 = null',       detect(2025, 11, 26), null);

// ── Veterans Day ─────────────────────────────────────────────────────────────
console.log('\nVeterans Day (Nov 4 – Nov 18):');
// Halloween window: Oct 31 ±4 days = Oct 27–Nov 4 (inclusive)
// Veterans Day window: Nov 11 ±7 days = Nov 4–Nov 18 (inclusive)
// Both include Nov 4 — Halloween takes priority because it is checked first in detect()
expect('Nov 4  = halloween (priority over veterans)', detect(2025, 11, 4),  'halloween');
expect('Nov 5  = veterans',  detect(2025, 11, 5),  'veterans');
expect('Nov 11 = veterans',  detect(2025, 11, 11), 'veterans');
expect('Nov 18 = veterans',  detect(2025, 11, 18), 'veterans');
expect('Nov 19 = null',      detect(2025, 11, 19), null);

// ── Chinese New Year ─────────────────────────────────────────────────────────
console.log('\nChinese New Year:');
// 2026: Feb 17 ±3 → Feb 14–20
expect('CNY 2026 Feb 14 = chinese-new-year', detect(2026, 2, 14), 'chinese-new-year');
expect('CNY 2026 Feb 17 = chinese-new-year', detect(2026, 2, 17), 'chinese-new-year');
expect('CNY 2026 Feb 20 = chinese-new-year', detect(2026, 2, 20), 'chinese-new-year');
// Note: Feb 14 is also Valentine's Day — CNY takes priority
expect('CNY wins over valentines on Feb 14 2026', detect(2026, 2, 14), 'chinese-new-year');
expect('CNY 2026 Feb 13 = valentines (outside CNY window)', detect(2026, 2, 13), 'valentines');
// Unknown year: no CNY
// 2023 is intentionally absent from the cny table (table starts at 2024)
expect('CNY 2023 = null (year intentionally absent from table)', detect(2023, 2, 5), null);

// ── Valentine's Day ──────────────────────────────────────────────────────────
console.log('\nValentine\'s Day (Feb 7 – Feb 21):');
expect('Feb 7  = valentines', detect(2025, 2, 7),  'valentines');
expect('Feb 14 = valentines', detect(2025, 2, 14), 'valentines');
expect('Feb 21 = valentines', detect(2025, 2, 21), 'valentines');
expect('Feb 6  = null',       detect(2025, 2, 6),  null);
expect('Feb 22 = null',       detect(2025, 2, 22), null);

// ── St. Patrick's Day ────────────────────────────────────────────────────────
console.log('\nSt. Patrick\'s Day (Mar 10 – Mar 24):');
expect('Mar 10 = st-patricks', detect(2025, 3, 10), 'st-patricks');
expect('Mar 17 = st-patricks', detect(2025, 3, 17), 'st-patricks');
expect('Mar 24 = st-patricks', detect(2025, 3, 24), 'st-patricks');
expect('Mar 9  = null',        detect(2025, 3, 9),  null);
expect('Mar 25 = null',        detect(2025, 3, 25), null);

// ── 4th of July ──────────────────────────────────────────────────────────────
console.log('\n4th of July (Jun 27 – Jul 11):');
expect('Jun 27 = july-4th', detect(2025, 6, 27), 'july-4th');
expect('Jul 4  = july-4th', detect(2025, 7, 4),  'july-4th');
expect('Jul 11 = july-4th', detect(2025, 7, 11), 'july-4th');
expect('Jun 26 = null',     detect(2025, 6, 26), null);
expect('Jul 12 = null',     detect(2025, 7, 12), null);

// ── MLK Day ──────────────────────────────────────────────────────────────────
console.log('\nMLK Day (3rd Monday of January ±3 days):');
// 2026: 3rd Monday = Jan 19. Window: Jan 16–22.
expect('MLK 2026 Jan 16 = mlk', detect(2026, 1, 16), 'mlk');
expect('MLK 2026 Jan 19 = mlk', detect(2026, 1, 19), 'mlk');
expect('MLK 2026 Jan 22 = mlk', detect(2026, 1, 22), 'mlk');
expect('MLK 2026 Jan 15 = null', detect(2026, 1, 15), null);
expect('MLK 2026 Jan 23 = null', detect(2026, 1, 23), null);

// ── Off-season dates ─────────────────────────────────────────────────────────
console.log('\nOff-season (no holiday):');
expect('May 1  = null', detect(2025, 5, 1),  null);
expect('Aug 15 = null', detect(2025, 8, 15), null);
expect('Sep 30 = null', detect(2025, 9, 30), null);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────');
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) {
  console.error('FAIL');
  process.exit(1);
} else {
  console.log('PASS');
}
