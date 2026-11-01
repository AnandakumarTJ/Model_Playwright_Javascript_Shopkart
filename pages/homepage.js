const appConfig = require('../config/appConfig');
const {expect} = require('@playwright/test');
class Homepage{    


    constructor(page){
        this.page = page;
        this.searchBox = page.getByTestId('input-header-search-desktop');
        this.searchButton = page.getByTestId('btn-header-search-desktop');
        this.pageNotFoundLoc = page.locator('h2:has-text("Page not found")');
    }

    async searchForProducct(productName){
        await this.searchBox.fill(productName);
        await this.searchButton.click();
    }

    async verifyPageNotFound(){
        await this.page.goto(appConfig.appURL+'/invalid');
        await expect(this.pageNotFoundLoc).toBeVisible();
    }

   
}
module.exports =  Homepage;