//@ts-check

const { webkit } = require('playwright');

var orders = [
{
  name: 'LN1 Pad Thai',
  special: 'no peanuts'
},
{
  name: 'LK6 Kow Pad Kra Tiem',
  special: 'no onions'
}];
var order = orders[Math.floor(Math.random()*orders.length)];

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('https://thaitastetogomi.smiledining.com/');

  // exit popup
  await page.click('button.close.close-button');
  await page.waitForTimeout(1000);

  // click food entry
  await page.click(`css=span.foodName-text >> text="${order.name}"`);
  await page.waitForTimeout(1000);

  // select options - needs to include "special" notes for order
  const chickenValue = "Srd8o2evE8g=";
  const mediumPlusValue = "D4g2pzByV40=";
  await page.click(`input[value="${chickenValue}"] >> visible=true`);
  await page.click(`input[value="${mediumPlusValue}"] >> visible=true`);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: `example.png` });
  await browser.close();
})();
