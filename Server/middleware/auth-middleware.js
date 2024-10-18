const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    let api_token = req.cookies.api_token || req.headers['authorization'];
    // console.log(token);
    // console.log("Original token from cookies: ", api_token);

    if (!api_token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorised User!'
        });
    }

    // if (api_token) {
    //     api_token = api_token.split(' ')[1]; // Remove 'Bearer' from the token
    // }
    
    if (api_token.startsWith('Bearer ')) {
        api_token = api_token.split(' ')[1]; // Remove 'Bearer' from the token
    }

    // console.log(api_token);
    try {
        const decoded = jwt.verify(api_token, process.env.JWT_SECRET_KEY);
        // console.log(decoded);
        req.user = decoded;
        // console.log(req.user);
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({
            success: false,
            message: 'Unauthorised User!'
        })
    }
}

module.exports = authMiddleware;