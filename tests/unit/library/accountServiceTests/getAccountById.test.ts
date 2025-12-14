jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findById: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";

describe("AccountServiceImplMongo.getAccountById", () => {
    const service = new AccountServiceImpMongo()
    const userId = 99999;

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue(null);
        await expect(service.getAccountById(99999))
            .rejects.toThrow(`account with id ${userId} is not found`);
        expect(accountDatabase.findById).toHaveBeenCalledWith(userId);
    })

    test('passed test: account returned', async () => {
        const mockAccount = {
            _id: 12345,
            userName: 'Piter',
            email: 'piter_email@gmail.com',
            passHash: 'somehash',
            birthDate: '10.10.2000',
            roles: ['admin'],
        };
        (accountDatabase.findById as jest.Mock).mockResolvedValue(mockAccount);
        const result = await service.getAccountById(userId);
        expect(accountDatabase.findById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockAccount);
    })
})