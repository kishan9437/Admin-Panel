const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token
    // console.log(token);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorised User!'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
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