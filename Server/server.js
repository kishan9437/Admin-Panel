require("dotenv").config();
const express=require('express');
const app = express();
const connectDB= require('./config/db');
const authRouter= require('./routes/auth/auth-routes');
const websiteRouter = require('./routes/admin/Website-routes');
const websiteUrlRouter = require('./routes/admin/WebsiteUrl-routes');
const activityRouter = require('./routes/admin/Activity-routes');
const crawlErrorRouter = require('./routes/admin/CrawlError-router');
const error500websiteRouter = require('./routes/admin/error500Websites-routes')
const error400websiteRouter = require('./routes/admin/error400Website-routes')
const crawlsessionRouter = require('./routes/admin/CrawlSession-routes')
const chartRouter = require('./routes/admin/Chart-routes')
const pageRenderRouter = require('./routes/admin/PageRender-routes')
const urlactivity = require('./routes/admin/UrlActivity-routes')
const cookieParser=require('cookie-parser');
const cors=require('cors');

app.use(cors({
    origin: ' http://localhost:5173',
    methods: ['GET','POST','PUT','DELETE','PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization','Cache-Control','Expires','Pragma']  
 }));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api',websiteRouter);

app.use('/api',websiteUrlRouter);

app.use('/api',activityRouter);

app.use('/api',crawlErrorRouter)

app.use('/api',error500websiteRouter)

app.use('/api',error400websiteRouter)

app.use('/api',crawlsessionRouter)

app.use('/api',chartRouter)

app.use('/api',pageRenderRouter)

app.use('/api',urlactivity)

const PORT=5000;
connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`)    
    });
})
