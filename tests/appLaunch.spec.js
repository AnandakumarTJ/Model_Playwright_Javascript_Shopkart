const {test, expect} = require('@playwright/test');
const {launchshopkart} = require('../utills/fixtures.js');
const dataConfig = require('../config/dataConfig.js');
const Homepage = require('../pages/homepage.js');
const ApiUtills = require('../utills/apiUtills.js');

launchshopkart('Launch Shopkart Application with Valid Url and Verify the Title', async ({homePageLaunch}) => {
    await expect(homePageLaunch).toHaveTitle(dataConfig.appTitle);
});

test('Launch Shopkart Application with Invalid Url and Verify the Title', async ({page}) => {
    const homepage = new Homepage(page);
    const apiUtills = new ApiUtills();
    await homepage.verifyPageNotFound();
    await apiUtills.getAPIResponse('/invalid', 404);
    
});