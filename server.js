const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require ('swagger-ui-express');
const bodyParser = require('body-parser');
const cors=require('cors');

//Load env vars
dotenv.config({path:'./config/config.env'});

connectDB();

//Route files
const companies = require('./routes/companies');
const auth = require('./routes/auth');
const interviews = require('./routes/interviews');

const app = express();

//Body parser
app.use(express.json());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//Cookie parser
app.use(cookieParser());

const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max: 50
});
app.use(limiter);

//Mount routers
app.use('/api/v1/companies', companies);
app.use('/api/v1/auth', auth);
app.use('/api/v1/company/:companyId/interviews',interviews); //Allow Direct route to interviews
app.use('/api/v1/interviews',interviews);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(
        "Server running in",
        process.env.NODE_ENV,
        "on" + `${process.env.HOST} mode on port ${PORT}`)
    );

const swaggerOptions ={
    swaggerDefinition:{
        openapi:'3.0.0',
        info:{
            title:'Library API',
            version:'1.0.0',
            description:'Online Job Fair API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));  

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});