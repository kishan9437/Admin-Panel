const express=require('express');
const {registerUser,loginUser,logoutUser}= require('../../controllers/auth/auth-controller');
const authMiddleware = require('../../middleware/auth-middleware')

const router=express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);

router.post('/verify_token',authMiddleware, (req,res) => {
    const user = req.user;
    res.status(200).json({
        success:true,
        message:"Authentication user has been login",
        user,
    })
});

module.exports=router;