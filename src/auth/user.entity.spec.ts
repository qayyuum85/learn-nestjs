import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

describe('UserEntity', () => {
  describe('validate password', () => {
    let user: User;

    beforeEach(() => {
      user = new User();
      user.password = 'testPassword';
      user.salt = 'testSalt';
      bcrypt.hash = jest.fn();
    });

    it('return true as password is valid', async () => {
      bcrypt.hash.mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('return false as password is invalid', async () => {
      bcrypt.hash.mockReturnValue('wrongPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
