const express=require('express');
const {registerUser,loginUser,logoutUser,requestPasswordReset, resetPassword}= require('../../controllers/auth/auth-controller');
const authMiddleware = require('../../middleware/auth-middleware')

const router=express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout',logoutUser);
router.post('/forgot_password',requestPasswordReset); 
router.post('/resetPassword/:token',resetPassword)  

router.post('/verify_token',authMiddleware, (req,res) => {
    const user = req.user;
    res.status(200).json({
        success:true,
        message:"Authentication user has been login",
        user,
    })
});

module.exports=router;