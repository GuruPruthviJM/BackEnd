const express = require('express');
const path = require('path');
const fs = require('fs');  
const customerRouter = require('./routers/customer.router');
const ticketRouter = require('./routers/ticket.router');
const paymentRouter = require('./routers/payment.router');
const cors = require('cors');
const public_key = fs.readFileSync(path.join(process.cwd(),'keys', 'jwt2.public.key'), 'utf8');
const {tokenDecorder} = require('ca-webutils/jwt')

async function createApp(){ 

    const app = express();
    app.use(express.json());
    // const allowedOrigins = [
    //     'http://localhost',
    //     'http://localhost:3000',
    //     'http://localhost:7000',
    //     'http://localhost:8000',
    //     'http://localhost:8080',
    //     'http://localhost:5000',
    // ];
    // const corsOptions = {
    //     origin: function (origin, callback) {
    //         if (!origin || allowedOrigins.includes(origin)) {
    //             callback(null, origin);
    //         } else {
    //             callback(new Error('Not allowed by CORS'));
    //         }
    //     },
    //     credentials: true, 
    //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //     allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    // };

    app.use(cors());
    // app.options('*', cors(corsOptions));
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(tokenDecorder(public_key, {algorithms: ['RS256']}));
    app.use('/api/customers', customerRouter());
    app.use('/api/tickets', ticketRouter());
    app.use('/api/payments', paymentRouter());
    return app; 
}

module.exports = createApp;