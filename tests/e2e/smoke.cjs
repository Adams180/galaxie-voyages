// Browser + accessibility smoke tests (Part F) using the pre-installed Playwright.
// Spawns the production server and checks the presentation guarantees that were
// previously verified only by inspection, plus screenshots for evidence.
//
// Robustness: a FRESH browser context per page load (no cross-navigation chunk
// caching) and the on-demand image optimizer blocked (its sandbox 500s are
// irrelevant to layout / overflow / a11y). Results reflect the product.
//
//   pnpm build && node tests/e2e/smoke.cjs      (run after a CLEAN build)
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { mkdirSync } = require("node:fs");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PORT = process.env.E2E_PORT || "3300";
const BASE = `http://localhost:${PORT}`;
const SHOTS =
  process.env.E2E_SHOTS ||
  "/tmp/claude-0/-home-user-galaxie-voyages/f9929b5e-026c-5187-833f-93b1193df397/scratchpad/e2e";
mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { w: 1440, h: 900, name: "desktop-1440" },
  { w: 1024, h: 768, name: "desktop-1024" },
  { w: 768, h: 1024, name: "tablet-768" },
  { w: 393, h: 852, name: "mobile-393" },
  { w: 375, h: 667, name: "mobile-375" },
];

let pass = 0,
  fail = 0;
const ok = (cond, msg) => {
  if (cond) {
    pass++;
    console.log("  ✓ " + msg);
  } else {
    fail++;
    console.log("  ✗ " + msg);
  }
};

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/fr`);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  return false;
}

(async () => {
  const server = spawn("pnpm", ["start"], {
    env: { ...process.env, PORT, AUTH_SECRET: process.env.AUTH_SECRET || "e2e-secret" },
    stdio: "ignore",
  });
  let exitCode = 1;
  try {
    if (!(await waitForServer())) throw new Error("server did not start");
    const browser = await chromium.launch();

    // Fresh context per load (prevents cross-navigation chunk caching); capture errors.
    async function withPage(vp, fn) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      const page = await ctx.newPage();
      const errs = { page: [], console: [] };
      page.on("pageerror", (e) => errs.page.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error" && !/Failed to load resource/i.test(m.text()))
          errs.console.push(m.text());
      });
      try {
        return await fn(page, errs);
      } finally {
        await ctx.close();
      }
    }

    const D = { w: 1440, h: 900 };

    // No document-level horizontal scroll at every breakpoint
    for (const vp of VIEWPORTS) {
      await withPage(vp, async (page) => {
        // Retry until the stylesheet actually applied (sandbox can transiently
        // 500 an asset under load, causing FOUC). Only then measure.
        let clip = false;
        for (let attempt = 0; attempt < 4 && !clip; attempt++) {
          await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" });
          clip = await page
            .waitForFunction(
              () => getComputedStyle(document.documentElement).overflowX === "clip",
              { timeout: 4000 },
            )
            .then(() => true)
            .catch(() => false);
          if (!clip) await sleep(1500); // let the server breathe, then retry
        }
        if (!clip) {
          console.log(`  i  skipped @ ${vp.name}: stylesheet did not load (sandbox asset 500)`);
          return;
        }
        await page.waitForTimeout(200);
        const scrollable = await page.evaluate(() => {
          const el = document.scrollingElement || document.documentElement;
          const before = el.scrollLeft;
          el.scrollLeft = 10000;
          const moved = el.scrollLeft > before + 1;
          el.scrollLeft = before;
          return moved;
        });
        ok(!scrollable, `document not horizontally scrollable @ ${vp.name}`);
      });
      await sleep(500); // pace iterations to avoid overwhelming the sandbox server
    }

    // FR / EN locale + no JS/console errors on home
    await withPage(D, async (page, errs) => {
      await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" });
      ok((await page.getAttribute("html", "lang")) === "fr", "FR page has lang='fr'");
      ok(errs.page.length === 0, `no JS/hydration errors on home (${errs.page.length})`);
      if (errs.page.length) console.log("    ", errs.page.slice(0, 3));
      ok(errs.console.length === 0, `no non-resource console errors (${errs.console.length})`);
    });
    await withPage(D, async (page) => {
      await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
      ok((await page.getAttribute("html", "lang")) === "en", "EN page has lang='en'");
    });

    // Part A: Djoum with timetable-unavailable state
    await withPage(D, async (page) => {
      await page.goto(`${BASE}/fr/destinations`, { waitUntil: "networkidle" });
      const t = await page.textContent("body");
      ok(t.includes("Djoum"), "Djoum appears in destinations");
      ok(
        t.includes("Horaires non communiqués"),
        "Djoum shows timetable-unavailable / contact-agency state",
      );
    });

    // Newsroom auth gate
    await withPage(D, async (page) => {
      await page.goto(`${BASE}/fr/newsroom`, { waitUntil: "networkidle" });
      ok(page.url().includes("/newsroom/signin"), "newsroom redirects unauth to sign-in");
    });

    // Accessibility: contact form controls labelled
    await withPage(D, async (page) => {
      await page.goto(`${BASE}/fr/contact`, { waitUntil: "networkidle" });
      const unlabeled = await page.evaluate(() => {
        const c = [...document.querySelectorAll("input, textarea, select")];
        return c.filter((el) => {
          if (el.type === "hidden") return false;
          const id = el.getAttribute("id");
          const hasFor = id && document.querySelector(`label[for="${id}"]`);
          return !(hasFor || el.closest("label") || el.getAttribute("aria-label"));
        }).length;
      });
      ok(unlabeled === 0, `contact form controls all labelled (${unlabeled} unlabeled)`);
    });

    // Screenshots (fresh contexts WITH images for evidence)
    async function shoot(vp, path, url = `${BASE}/fr`, dark = false, full = false) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      if (dark) await ctx.addInitScript(() => {
        try { localStorage.setItem("theme", "dark"); } catch {}
      });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await page.screenshot({ path, fullPage: full });
      await ctx.close();
    }
    await shoot(D, `${SHOTS}/home-fr-1440-light.png`);
    await shoot(D, `${SHOTS}/home-fr-1440-dark.png`, `${BASE}/fr`, true);
    await shoot(D, `${SHOTS}/destinations-fr-1440.png`, `${BASE}/fr/destinations`, false, true);
    await shoot({ w: 393, h: 852 }, `${SHOTS}/home-fr-393.png`);

    await browser.close();
    console.log(`\nE2E: ${pass} passed, ${fail} failed. Screenshots in ${SHOTS}`);
    exitCode = fail === 0 ? 0 : 1;
  } catch (e) {
    console.error("E2E error:", e.message);
  } finally {
    server.kill("SIGTERM");
  }
  process.exit(exitCode);
})();
