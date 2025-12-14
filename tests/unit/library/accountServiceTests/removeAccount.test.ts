jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findByIdAndDelete: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";

describe("AccountServiceImplMongo.removeAccount", () => {
    const service = new AccountServiceImpMongo()
    const userId = 12345;
    const mockAccount = {
        _id: 12345,
        userName: 'Piter',
        email: 'piter_email@gmail.com',
        passHash: 'somehash',
        birthDate: '10.10.2000',
        roles: ['admin'],
    };

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findByIdAndDelete as jest.Mock).mockResolvedValue(null)
        await expect(service.removeAccount(userId))
            .rejects.toThrow(`account with id ${userId} is not found`);
        expect(accountDatabase.findByIdAndDelete).toHaveBeenCalledWith(userId)
    })

    test('passed test: account is removed', async () => {
        (accountDatabase.findByIdAndDelete as jest.Mock).mockResolvedValue(mockAccount)
        const result = await service.removeAccount(userId);
        expect(accountDatabase.findByIdAndDelete).toHaveBeenCalledWith(userId)
        expect(result).toEqual(mockAccount);
    })
})