jest.mock('../../../../src/app.js', () => ({
    accountDatabase: {
        findById: jest.fn(),
        create: jest.fn(),
    },
}));

import {accountDatabase} from "../../../../src/app.js";
import {AccountServiceImpMongo} from "../../../../src/service/AccountServiceImpMongo.js";
import {User} from "../../../../src/model/user.js";

describe("AccountServiceImplMongo.createAccount", () => {
    const service = new AccountServiceImpMongo()

    const mockAccount = {
        _id: 12345,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("failed test: account already exists", () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue(mockAccount);
        expect(service.createAccount(mockAccount as User)).rejects.toThrow(`duplicated userId ${mockAccount._id}, account not created`)
        expect(accountDatabase.findById).toHaveBeenCalledWith(mockAccount._id);
    })

    test("passed test: account created", () => {
        (accountDatabase.findById as jest.Mock).mockResolvedValue(undefined);
        (accountDatabase.create as jest.Mock).mockResolvedValue(undefined)
        expect(service.createAccount(mockAccount as User)).resolves.toBeUndefined()
        expect(accountDatabase.findById).toHaveBeenCalledWith(mockAccount._id);
    })
})