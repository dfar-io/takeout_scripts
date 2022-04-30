//@ts-check

const { webkit } = require('playwright');

var lunchOrders = [
{
  name: 'LN1 Pad Thai',
  special: 'no peanuts'
},
{
  name: 'LK6 Kow Pad Kra Tiem',
  special: 'no onions'
}];

var dinnerOrders = [
{
  name: 'N1 Pad Thai',
  special: 'no peanuts'
},
{
  name: 'K6 Kow Pad Kra Tiem',
  special: 'no onions'
}];

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  try {
    await page.goto('https://thaitastetogomi.smiledining.com/');

    // exit popup
    await page.click('button.close.close-button');

    // check which menu is available
    const isLunchMenu = await page.evaluate(el => el.classList.contains('theme'), await page.$('label[for="tab1"]'));
    console.log(`isLunchMenu: ${isLunchMenu}`);

    // select order
    const order = isLunchMenu ? 
      lunchOrders[Math.floor(Math.random() * lunchOrders.length)] :
      dinnerOrders[Math.floor(Math.random() * dinnerOrders.length)];
    console.log(`order: ${order.name}`);

    // click food entry
    await page.click(`css=span.foodName-text >> text="${order.name}"`);

    // select options - needs to include "special" notes for order
    const chickenValue = "Srd8o2evE8g=";
    const mediumPlusValue = "D4g2pzByV40=";
    await page.click(`input[value="${chickenValue}"] >> visible=true`);
    await page.click(`input[value="${mediumPlusValue}"] >> visible=true`);
    await page.fill('textarea', order.special);
    await page.click('button:has-text("Add to cart") >> nth=0');

    // click checkout, then checkout as quest
    await page.click(`button.theme-btn-checkout >> nth=2`);
    await page.click('div.button >> nth=1');

    // fill out guest information
    await page.fill('#txtGuestFirstName', 'Dave');
    await page.fill('#txtGuestLastName', 'Farinelli');
    await page.fill('#txtGuestEmail', 'a@a.com');
    await page.fill('#txtGuestPhone', '(123) 456-7890');
    await page.click(`#btn-next-user`);
    await page.waitForTimeout(5000);
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();
