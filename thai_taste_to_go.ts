//@ts-check

const { webkit } = require('playwright');

var lunchOrders = [
{
  name: 'LK6 Kow Pad Kra Tiem',
  special: 'no onions'
}];

var dinnerOrders = [
{
  name: 'K6 Kow Pad Kra Tiem',
  special: 'no onions'
}];

(async () => {
  const isLiveRun = process.argv[2] && process.argv[2] === '-live';
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  try {
    const env = getEnvVars();
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
    await page.fill('#txtGuestFirstName', env.FIRST_NAME);
    await page.fill('#txtGuestLastName', env.LAST_NAME);
    await page.fill('#txtGuestEmail', env.EMAIL);
    await page.fill('#txtGuestPhone', env.PHONE_NUMBER);
    // let's try waiting to see if there's an issue populating fields
    await page.waitForTimeout(2000);
    await page.click(`#btn-next-user`);

    // progress to CC info
    await page.click(`button.theme-btn-checkout >> nth=2`);

    // fill out CC info
    await page.fill('.txtCCNumber', env.CC_NUMBER);
    await page.fill('#txtCCName', `${env.FIRST_NAME} ${env.LAST_NAME}`);
    await page.fill('#txtCCExpiry', env.CC_EXPIRY);
    await page.fill('#txtCCCVC', env.CC_CVC);
    await page.fill('#txtBillingAddress', env.ADDRESS);
    await page.fill('#txtBillingZip', env.ZIP);
    await page.click('button[value="10"]');
    await page.click(`button.theme-btn-checkout >> nth=6`);

    // click confirm if non-dry run.
    if (isLiveRun) {
      await page.click('button.swal2-confirm');
      await page.waitForTimeout(6000);
    } else {
      console.log('Dry run: order not submitted.');
    }
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();

function getEnvVars() {
  const envVars = {
    FIRST_NAME: process.env.FIRST_NAME,
    LAST_NAME: process.env.LAST_NAME,
    CC_NUMBER: process.env.CC_NUMBER,
    CC_EXPIRY: process.env.CC_EXPIRY,
    CC_CVC: process.env.CC_CVC,
    ADDRESS: process.env.ADDRESS,
    ZIP: process.env.ZIP,
    EMAIL: process.env.EMAIL,
    PHONE_NUMBER: process.env.PHONE_NUMBER
  };
    
  verifyEnvVars(envVars)
    
  return envVars;
}

function verifyEnvVars(env_vars) {
  for (const property in env_vars) {
    const value = env_vars[property];
    if (value === undefined || value === '') {
      console.error(`Environment variable ${property} not defined.`)
      process.exit(1);
    }
  }
}
