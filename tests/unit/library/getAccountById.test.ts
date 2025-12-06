import {AccountServiceImpMongo} from "../../../src/service/AccountServiceImpMongo.js";

describe('AccountServiceImpMongo.getAccountById', () => {
    const service = new AccountServiceImpMongo()
    test('Failed test', async () => {
        const userId = 99999;
        await expect(service.getAccountById(userId))
            .rejects.toThrow(`account with id ${userId} is not found`)
    })
})