const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// register 
const registerUser = async (req, res) => {
    const { first_name, last_name, email, password, password_confirmation } = req.body;

    try {
        const checkUser = await User.findOne({ email });

        if (checkUser) {
            return res.json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPasswordConfirmation = await bcrypt.hash(password_confirmation, 10);

        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            password_confirmation: hashedPasswordConfirmation,
        });

        await newUser.save();

        const api_token = jwt.sign(
            {
                id: newUser._id,
                role: newUser.role,
                email: newUser.email
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '2h'  // token will expire in 1 hour
            }
        );

        res.cookie("api_token", api_token, { httpOnly: true, secure: false }).json({
            success: true,
            message: 'Registration successful',
            api_token: api_token
        });

        // res.status(200).json({
        //     success: true,
        //     message: 'Registration successful'
        // });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internel Server Error'
        });
    }
}

// login 
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const checkUser = await User.findOne({ email });

        if (!checkUser) {
            return res.json({
                success: false,
                message: "User doesn't exists! Please register first",
            });
        }
        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);

        if (!checkPasswordMatch) {
            return res.json({
                success: false,
                message: "Incorrect password! Please try again",
            });
        }

        const api_token = jwt.sign(
            {
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '2h'  // token will expire in 1 hour
            }
        );

        res.cookie("api_token", api_token, { httpOnly: true, secure: false }).json({
            success: true,
            message: 'Login successful',
            api_token: api_token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internel Server Error'
        });
    }
}

// forgot password
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    // console.log(email);
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'No user found with this email',
            });
        }

        // Generate a password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // reset token Expires time 
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // create the reset url
        const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;

        // Send reset email (using nodemailer or any email service)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
                logger: true,
                debug: true
            }
        });
        console.log(user.email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetURL}">${resetURL}</a>`,
        }

        await transporter.sendMail(mailOptions)

        res.json({
            success: true,
            message: 'Password reset link sent to your email!',
            resetPasswordToken: resetToken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internel Server Error'
        });
    }
}

// reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, password_confirmation } = req.body;

    try {
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() },
        })

        if (!user) {
            return res.json({
                success: false,
                message: 'Reset token is invalid or expired'
            })
        }

        if (password !== password_confirmation) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.password_confirmation = await bcrypt.hash(password_confirmation, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internel Server Error'
        });
    }
}
// logout user
const logoutUser = (req, res) => {
    res.clearCookie("token").json({
        success: true,
        message: 'Logged out successfully'
    });
}
module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword };