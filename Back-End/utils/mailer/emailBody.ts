import dotenv from 'dotenv';
dotenv.config();
export const passwordResetMail = ((otp : string) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 480px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin-top: 15px;
        }
        .otp-input {
            display: block;
            width: 60%;
            margin: 10px auto;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border: 2px solid #ccc;
            border-radius: 5px;
        }
        .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Khdamli-Dev</div>
        <p class="header">Reset Your Password</p>
        <p class="message">Hello,</p>
        <p class="message">You're receiving this email because you requested a password reset. Enter the OTP below to reset your password.</p>
        <input type="text" class="otp-input" value="${otp}" readonly onclick="this.select();document.execCommand('copy');">
        <p class="message">If you didn't request this, you can ignore this email. Your password will remain unchanged.</p>
        <p class="footer">The Khdamli-Dev Team</p>
    </div>
</body>
</html>
`
});
export const emailConfirmationMail = ((otp : string) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 480px;
            margin: 30px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .header {
            font-size: 22px;
            font-weight: bold;
            color: #333;
        }
        .message {
            font-size: 16px;
            color: #555;
            margin-top: 15px;
        }
        .otp-input {
            display: block;
            width: 60%;
            margin: 10px auto;
            padding: 10px;
            font-size: 18px;
            text-align: center;
            border: 2px solid #ccc;
            border-radius: 5px;
        }
        .footer {
            font-size: 13px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Khdamli-Dev</div>
        <p class="header">Account Verification</p>
        <p class="message">Hello,</p>
        <p class="message">To start using the app, please verify your email address by entering the code below:</p>
        <input type="text" class="otp-input" value="${otp}" readonly onclick="this.select();document.execCommand('copy');">
        <p class="message">Thank you for joining us!</p>
        <p class="footer">The Khdamli-Dev Team</p>
    </div>
</body>
</html>
`
});