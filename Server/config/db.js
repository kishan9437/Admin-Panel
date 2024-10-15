const mongoose= require('mongoose');

const URI=process.env.MONGODB_URI;

const connectDB= async ()=>{
    try {
        await mongoose.connect(URI);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error('database connection error',error.message);
        process.exit(0);
    }
}

module.exports=connectDB;