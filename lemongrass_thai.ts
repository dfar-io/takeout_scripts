//@ts-check

const { webkit } = require('playwright');

var dinnerOrders = [
{
  name: 'RN7 Drunken Noodle (Pad Khee Mao) (D)',
  special: 'no bell peppers'
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
    await page.goto('https://www.onestopordering.com/ordering/restaurant/menu?restaurant_uid=2c4ee1db-3ce0-4bc4-8999-6cbf4e33ef61');

    // select order
    const order = dinnerOrders[Math.floor(Math.random() * dinnerOrders.length)];

    // click food entry
    await page.locator(`div:text-is("${order.name}")`).click();

    // select options - needs to include "special" notes for order
    const shrimpId = "#label-5816459";
    const mediumPlusId = "#label-5819451";
    await page.click(`${shrimpId}`);
    await page.click(`${mediumPlusId}`);
    await page.fill('textarea.instructions', order.special);
    await page.click('div:text-is("Add to cart")');

    // click checkout
    await page.click(`svg.svg-icon-cart`);

    // fill out contact info
    await page.click('span:text-is("Add details")');
    await page.fill('input[name=firstName]', env.FIRST_NAME);
    await page.fill('input[name=lastName]', env.LAST_NAME);
    await page.fill('input[name=email]', env.EMAIL);
    await page.fill('input[name=phone]', env.PHONE_NUMBER);
    await page.click('div:text-is("Save")');

    // fill out CC info
    await page.click('span:text-is("Select payment method")');
    await page.click('span:text-is("Card at pickup counter")');
    await page.click('div:text-is("Save")');

    // click confirm if non-dry run.
    if (isLiveRun) {
      await page.click('div:text-is("Place Pickup Order Now")');
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
