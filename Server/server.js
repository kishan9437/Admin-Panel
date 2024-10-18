require("dotenv").config();
const express=require('express');
const app = express();
const connectDB= require('./config/db');
const authRouter= require('./routes/auth/auth-routes');
const websiteRouter = require('./routes/admin/Website-routes')
const cookieParser=require('cookie-parser');
const cors=require('cors');

app.use(cors({
    origin: ' http://localhost:5173',
    methods: ['GET','POST','PUT','DELETE','PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization','Cache-Control','Expires','Pragma']  // Add other headers as needed
 }));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api',websiteRouter)

const PORT=5000;
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`)    
    });
})
