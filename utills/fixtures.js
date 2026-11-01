const base = require('@playwright/test');
const appConfig = require('../config/appConfig');

exports.launchshopkart = base.test.extend({
        homePageLaunch: async ({page}, use) =>{
        await page.goto(appConfig.appURL);

        await use(page);
    }
});

