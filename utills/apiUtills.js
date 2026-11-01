const { request, expect } = require('@playwright/test');
const appConfig = require('../config/appConfig');

class ApiUtills {

    async getAPIResponse(apiEndPoint, expectedStatusCode) {

        const apiContext = await request.newContext();

        try {
            const apiResponse = await apiContext.get(
                appConfig.appURL + apiEndPoint
            );

            expect(apiResponse.status()).toBe(expectedStatusCode);

            return apiResponse;

        } finally {
            await apiContext.dispose();
        }
    }
}

module.exports = ApiUtills;