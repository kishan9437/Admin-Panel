const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
            password_confirmation:hashedPasswordConfirmation,
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
                expiresIn: '1h'  // token will expire in 1 hour
            }
        );

        res.cookie("token", api_token, { httpOnly: true, secure: false }).json({
            success: true,
            message: 'Registration successful',
            token: api_token
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
                expiresIn: '1h'  // token will expire in 1 hour
            }
        );

        res.cookie("token", api_token, { httpOnly: true, secure: false }).json({
            success: true,
            message: 'Login successful',
            token: api_token
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
module.exports = { registerUser, loginUser , logoutUser};