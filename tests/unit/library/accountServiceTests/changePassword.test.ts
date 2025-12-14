jest.mock('bcryptjs');
jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findById: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";
import bcrypt from "bcryptjs";

describe("AccountServiceImplMongo.changePassword", () => {
    const service = new AccountServiceImpMongo()
    const passData = {
        _id: 12345,
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
    }

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.changePassword(passData._id, passData.oldPassword, passData.newPassword))
            .rejects.toThrow(`account with id ${passData._id} is not found`);
        expect(accountDatabase.findById).toHaveBeenCalledWith(passData._id)
    })

    test('failed test: wrong credentials', async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue({passHash: 'oldhash'});
        (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
        await expect(service.changePassword(passData._id, passData.oldPassword, passData.newPassword))
            .rejects.toThrow("wrong credentials");
        expect(accountDatabase.findById).toHaveBeenCalledWith(passData._id)
        expect(bcrypt.compareSync).toHaveBeenCalledWith(passData.oldPassword, "oldhash")
    })

    test('passed test: password is changed',  async () => {
        const mockSave = jest.fn().mockResolvedValue(undefined);
        (accountDatabase.findById as jest.Mock).mockResolvedValue({passHash: 'oldhash', save: mockSave});
        (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
        (bcrypt.hashSync as jest.Mock).mockReturnValue('newhash');
        await expect(service.changePassword(passData._id, passData.oldPassword, passData.newPassword)).resolves.toBeUndefined();
        expect(accountDatabase.findById).toHaveBeenCalledWith(passData._id);
        expect(bcrypt.compareSync).toHaveBeenCalledWith(passData.oldPassword, "oldhash");
        expect(bcrypt.hashSync).toHaveBeenCalledWith(passData.newPassword, 10);
        expect(mockSave).toHaveBeenCalled();
    })
})