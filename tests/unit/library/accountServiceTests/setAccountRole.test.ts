jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findByIdAndUpdate: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";

describe("AccountServiceImplMongo.setAccountRole", () => {
    const service = new AccountServiceImpMongo()
    const mockRoles = {roles: ['reader']};
    const mockAccount = {
        _id: 12345,
        roles: ['admin'],
    };

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)
        await expect(service.setAccountRole(mockAccount._id, mockRoles.roles))
            .rejects.toThrow(`account with id ${mockAccount._id} is not found`);
        expect(accountDatabase.findByIdAndUpdate).toHaveBeenCalledWith(mockAccount._id, mockRoles, {new:true})
    })

    test('passed test: account roles are updated', async () => {
        (accountDatabase.findByIdAndUpdate as jest.Mock).mockResolvedValue({...mockAccount, ...mockRoles})
        const result = await service.setAccountRole(mockAccount._id, mockRoles.roles);
        expect(accountDatabase.findByIdAndUpdate).toHaveBeenCalledWith(mockAccount._id, mockRoles, {new:true})
        expect(result).toEqual({...mockAccount, ...mockRoles});
    })
})