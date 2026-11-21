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
  await expect(page.getByText("Development preview:")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();

  await page.getByRole("button", { name: "Counties" }).click();
  await expect(page.getByPlaceholder("Search counties…")).toBeVisible();

  await page.getByPlaceholder("Search counties…").fill("Palm Beach");
  const marketRow = page.getByRole("button", {
    name: "Palm Beach County Florida",
  });
  await expect(marketRow).toBeVisible();

  await marketRow.click();
  await expect(
    page.getByRole("dialog", { name: "Palm Beach County" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
