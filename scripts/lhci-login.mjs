/**
 * Puppeteer script for Lighthouse CI — logs in as demo student before auditing dashboard.
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md#puppeteerscript
 */

export default async function puppeteerScript(page, context) {
  const base = context.url.replace(/\/student\/dashboard.*$/, "");
  const loginUrl = `${base}/login`;

  await page.goto(loginUrl, { waitUntil: "networkidle0" });

  await page.waitForSelector("#email");
  await page.type("#email", "thiago.demo@escola.pi.gov.br");
  await page.type("#password", "senhaDemo123");

  const studentRole = await page.$('input[value="student"]');
  if (studentRole) {
    await studentRole.click();
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('button[type="submit"]'),
  ]);

  const url = page.url();
  if (!url.includes("/student/dashboard")) {
    throw new Error(`Login did not reach dashboard. Current URL: ${url}`);
  }
}
