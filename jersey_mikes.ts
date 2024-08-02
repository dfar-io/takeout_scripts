//@ts-check
const { webkit } = require('playwright');

(async () => {
  const isLiveRun = process.argv[2] && process.argv[2] === '-live';
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  try {
    const env = getEnvVars();

    // select location
    await page.goto('https://www.jerseymikes.com/locations');

    // close cookie opt out pop-up
    await page.click('.banner-close-button');

    // select store
    await page.fill('#input-field-address', env.ZIP);
    await page.click(`p:text-is("${env.ZIP}")`);
    await page.click('p:text-is("West Bloomfield")');
    await page.click('button:text-is("In-Store Pickup")');

    // select sandwich, customize, add to order
    await page.click('div:text-is("Turkey and Provolone")');
    await page.click('div#select-size');
    await page.click('p:text-is("Giant")');
    await page.click('div#select-bread');
    await page.click('p:text-is("Rosemary Parmesan Bread")');
    await page.click('button:text-is("Customize")');
    await page.click('input[name="Tomatoes"]');
    await page.click('input[name="Red Wine Vinegar"]');
    await page.click('input[name="Olive Oil Blend"]');
    await page.click('input[name="Hot Chopped Pepper Relish"]');
    await page.click('span:text-is("Add to Order")');

    // checkout
    await page.click('button:text-is("Checkout")');
    await page.fill('#input-field-account-form-firstName', env.FIRST_NAME);
    await page.fill('#input-field-account-form-lastName', env.LAST_NAME);
    await page.fill('#input-field-account-form-mobileNumber', env.PHONE_NUMBER);
    await page.fill('#input-field-account-form-email', env.EMAIL);
    await page.click('button:text-is("Continue")');

    // enter CC info through iframe
    const targetFrame = await page.frameLocator("#targetFrame");
    await targetFrame.locator('#ccName').fill(`${env.FIRST_NAME} ${env.LAST_NAME}`);
    await targetFrame.locator('#ccNum').fill(env.CC_NUMBER);
    await targetFrame.locator('#expiry').fill(env.CC_EXPIRY);
    await targetFrame.locator('#cvv').fill(env.CC_CVC);
    await targetFrame.locator('#zip').fill(env.ZIP);
    await targetFrame.locator('.containerBtn').click();
    await page.waitForTimeout(5000);

    // place order only for live runs
    if (isLiveRun) {
      await page.click('button:has-text("Place Order")');
      await page.waitForTimeout(30000);
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
