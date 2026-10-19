const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { fixtures, respond } = require("./browserFixtures.cjs");
const base = process.env.QA_FRONTEND_URL || "http://127.0.0.1:5173";
const output = path.resolve(__dirname, "../../.qa/browser");
fs.mkdirSync(output, { recursive: true });

// Checks each role and viewport, then exercises presentation and error recovery.
async function verify() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [], errors = [], interactions = [];
  try {
    for (const role of ["Admin", "HR", "Employee"]) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const data = fixtures(role), mode = {};
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/api/**", (route) => respond(route, data, mode));
      await page.addInitScript((user) => {
        localStorage.setItem("token", "header." + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })) + ".signature");
        localStorage.setItem("user", JSON.stringify(user));
      }, data.user);
      const routes = ["dashboard", "employees", "departments", "attendance", "leave", "payroll", "login", "register"];
      if (role === "Admin") routes.push("users", "settings");
      for (const width of [1440, 1280, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of routes) {
          await page.goto(`${base}/${route}`);
          await page.waitForLoadState("networkidle");
          const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
          results.push({ role, route, ...dimensions });
          assert.ok(dimensions.scroll <= width, `${role} ${route} overflows at ${width}`);
          if (role === "Employee" && ["employees", "departments"].includes(route)) {
            assert.equal(await page.getByRole("button", { name: /^Add / }).count(), 0);
          }
          if (role === "Admin" && [1440, 390].includes(width) && ["dashboard", "employees", "leave", "login", "payroll"].includes(route)) {
            await page.screenshot({ path: path.join(output, `${route}-${width}.png`), fullPage: true });
          }
        }
      }
      if (role === "Admin") {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${base}/dashboard`); await page.waitForLoadState("networkidle");
        const menu = page.getByRole("button", { name: "Menu", exact: true });
        await menu.click();
        await page.getByRole("navigation").getByRole("link", { name: "Employees", exact: true }).click();
        await page.waitForLoadState("networkidle");
        assert.equal(await page.getByRole("navigation").isVisible(), false);
        await menu.click(); await page.keyboard.press("Escape");
        assert.equal(await menu.getAttribute("aria-expanded"), "false");
        interactions.push("Mobile navigation opens, follows links and closes with Escape");
        mode.dashboardError = true;
        await page.goto(`${base}/dashboard`); await page.getByRole("button", { name: "Try again" }).waitFor();
        mode.dashboardError = false;
        await page.getByRole("button", { name: "Try again" }).click();
        await page.getByText("Operations", { exact: true }).waitFor();
        interactions.push("Overview recovers from API failure");
        await page.goto(`${base}/employees`); await page.waitForLoadState("networkidle");
        await page.getByRole("button", { name: "Edit", exact: true }).click();
        assert.equal(await page.locator('input[name="name"]').inputValue(), "Alex Morgan");
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        assert.equal(await page.locator('input[name="name"]').inputValue(), "");
        for (const [key, value] of Object.entries({ employeeId: "QA002", name: "Preserved Name", designation: "Tester", email: "qa@example.test", phone: "0770000001", joiningDate: "2026-01-01", salary: "900" })) {
          await page.locator(`input[name="${key}"]`).fill(value);
        }
        await page.locator('select[name="department"]').selectOption("department1");
        await page.getByRole("button", { name: "Add employee", exact: true }).click();
        await page.getByRole("alert").waitFor();
        assert.equal(await page.locator('input[name="name"]').inputValue(), "Preserved Name");
        interactions.push("Employee edit/cancel works and failed saves preserve input");
        mode.empty = true; await page.reload(); await page.waitForLoadState("networkidle");
        assert.ok(await page.getByText(/No employees found/).count()); mode.empty = false;
        await page.goto(`${base}/payroll`); await page.waitForLoadState("networkidle");
        await page.getByRole("button", { name: "My payslips", exact: true }).click();
        await page.waitForLoadState("networkidle");
        assert.equal(await page.getByRole("button", { name: "Prepare payroll" }).count(), 0);
        await page.getByRole("button", { name: "View", exact: true }).click();
        await page.emulateMedia({ media: "print" });
        assert.equal(await page.locator(".topbar").isVisible(), false);
        assert.equal(await page.getByRole("button", { name: "Print payslip" }).isVisible(), false);
        await page.screenshot({ path: path.join(output, "payslip-print.png"), fullPage: true });
        await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
        assert.equal(await page.locator(".button").first().evaluate((el) => getComputedStyle(el).transitionDuration), "0s");
        interactions.push("Personal payroll, print exclusions and reduced motion work");
        await page.goto(`${base}/register`);
        await page.locator('input[name="name"]').fill("Test Person");
        await page.locator('input[name="email"]').fill("existing@example.test");
        await page.locator('input[name="password"]').fill("fixture-password");
        await page.getByRole("button", { name: "Create account", exact: true }).click();
        await page.getByRole("alert").waitFor();
        assert.equal(await page.locator('input[name="email"]').inputValue(), "existing@example.test");
        interactions.push("Registration validation preserves entered details");
      }
      await context.close();
      console.log(`${role} responsive checks complete.`);
    }
    assert.equal(errors.length, 0, errors.join("\n"));
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ screens: results.length, results, errors, interactions }, null, 2));
    console.log(JSON.stringify({ screens: results.length, errors, interactions }));
  } finally { await browser.close(); }
}
verify().catch((error) => { console.error(error); process.exitCode = 1; });
