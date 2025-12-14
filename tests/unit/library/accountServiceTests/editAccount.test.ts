jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findByIdAndUpdate: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";

describe("AccountServiceImplMongo.editAccount", () => {
    const service = new AccountServiceImpMongo()
    const mockAccount = {
        _id: 12345,
        passHash: 'passhash',
        roles: ['admin'],
        userName: 'John',
        email: 'john_email@gmail.com',
        birthDate: '15.03.1990'
    }

    const mockDTO = {
        userName: 'John',
        email: 'john_email@gmail.com',
        birthDate: '15.03.1990'
    }

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)
        await expect(service.editAccount(mockAccount._id, mockDTO))
            .rejects.toThrow(`account with id ${mockAccount._id} is not found`);
        expect(accountDatabase.findByIdAndUpdate).toHaveBeenCalledWith(mockAccount._id, mockDTO, {new:true})
    })

    test('passed test: account is updated', async () => {
        (accountDatabase.findByIdAndUpdate as jest.Mock).mockResolvedValue({...mockAccount, ...mockDTO})
        const result = await service.editAccount(mockAccount._id, mockDTO);
        expect(accountDatabase.findByIdAndUpdate).toHaveBeenCalledWith(mockAccount._id, mockDTO, {new:true})
        expect(result).toEqual({...mockAccount, ...mockDTO});
    })
})