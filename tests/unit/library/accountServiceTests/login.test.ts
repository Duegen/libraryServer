jest.mock('bcryptjs');
jest.mock('../../../../src/utils/tools.js');
jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findById: jest.fn(),
    },
}));

import {getJWT} from "../../../../src/utils/tools.js";
import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";
import bcrypt from "bcryptjs";

describe("AccountServiceImplMongo.login", () => {
    const service = new AccountServiceImpMongo()
    const loginData = {
        _id: 12345,
        password: 'password',
    }

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('failed test: account not found', async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.login(loginData._id, loginData.password))
            .rejects.toThrow(`account with id ${loginData._id} is not found`);
        expect(accountDatabase.findById).toHaveBeenCalledWith(loginData._id)
    })

    test('failed test: wrong credentials', async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue({passHash: 'passhash'});
        (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
        await expect(service.login(loginData._id, loginData.password))
            .rejects.toThrow("wrong credentials");
        expect(accountDatabase.findById).toHaveBeenCalledWith(loginData._id)
        expect(bcrypt.compareSync).toHaveBeenCalledWith(loginData.password, "passhash")
    })

    test('passed test: password is changed',  async () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue({passHash: 'passhash', roles: ['admin']});
        (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
        (getJWT as jest.Mock).mockReturnValue('new-jwt-token')
        const result = await service.login(loginData._id, loginData.password);
        expect(result).toEqual('new-jwt-token')
        expect(accountDatabase.findById).toHaveBeenCalledWith(loginData._id);
        expect(bcrypt.compareSync).toHaveBeenCalledWith(loginData.password, "passhash");
        expect(getJWT).toHaveBeenCalledWith(loginData._id, ['admin']);

    })
})