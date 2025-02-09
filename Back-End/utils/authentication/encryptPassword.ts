import crypto from 'crypto';
const encryptPassword = (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(8).toString('hex');
      crypto.scrypt(password, salt, 21, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}${derivedKey.toString('hex')}`);
      });
    });
};

export default encryptPassword;