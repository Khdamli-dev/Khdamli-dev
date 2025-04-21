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
export const emailConfirmationMail = ((token : string) => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Verification</title>
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
        .btn {
            display: inline-block;
            background: #28a745;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            padding: 12px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
            transition: 0.3s;
        }
        .btn:hover {
            background: #218838;
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
        <p class="header">Verify Your Email</p>
        <p class="message">Hello,</p>
        <p class="message">Thank you for signing up! Click the button below to verify your email address.</p>
        <a href="${process.env.APP_URL}/${token}" class="btn">Verify Email</a>
        <p class="message">If you didn't request this, you can ignore this email.</p>
        <p class="footer">The Khdamli-Dev Team</p>
    </div>
</body>
</html>
`
});