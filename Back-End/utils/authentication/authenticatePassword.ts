import crypto from 'crypto';
const authenticatePassword = (storedPassword: string, inputPassword: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const salt : string= storedPassword.slice(0, 16); // First 16 characters = salt
      const originalHash : string = storedPassword.slice(16); // Rest = hashed password
      crypto.scrypt(inputPassword, salt, 21, (err, derivedKey) => {
        if (err) reject(err);
        resolve(originalHash === derivedKey.toString('hex')); // Compare hashes
      });
    });
};

export default authenticatePassword;  