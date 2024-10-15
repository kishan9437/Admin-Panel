const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    password_confirmation:{
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'admin',
        enum: ['user', 'admin']
    }
});

const User= new mongoose.model('User', userSchema);
module.exports = User;