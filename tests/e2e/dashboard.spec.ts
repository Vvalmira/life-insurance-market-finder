import { expect, test } from "@playwright/test";

test("explores state and county rankings", async ({ page }) => {
  const dashboardReady = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/areas?") && response.status() === 200,
  );
  await page.goto("/");
  await dashboardReady;

  await expect(
    page.getByRole("heading", { name: /find the markets/i }),
  ).toBeVisible();
  await expect(page.getByText("ACS 2024", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View Census documentation" }),
  ).toHaveAttribute("href", /\/subject\.html$/);

  const sortTrigger = page.getByRole("button", {
    name: "Sort by National rank",
  });
  await sortTrigger.click();
  await page.getByRole("option", { name: "Opportunity score" }).click();
  await expect(
    page.getByRole("button", { name: "Sort by Opportunity score" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Counties" }).click();
  await expect(page.getByPlaceholder("Search counties…")).toBeVisible();
  await expect(page.getByText("Population coverage")).toBeVisible();

  await page.getByPlaceholder("Search counties…").fill("Palm Beach");
  const marketRow = page.getByRole("button", {
    name: "Palm Beach County Florida",
  });
  await expect(marketRow).toBeVisible();

  await marketRow.click();
  await expect(
    page.getByRole("dialog", { name: "Palm Beach County" }),
  ).toBeVisible();

  const detailPanel = page.getByRole("dialog", { name: "Palm Beach County" });
  const panelBox = await detailPanel.boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox?.width).toBeGreaterThan((viewport?.width ?? 0) * 0.7);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
