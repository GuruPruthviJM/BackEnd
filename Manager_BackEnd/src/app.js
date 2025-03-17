const express = require('express');
const path = require('path');
const fs = require('fs');
const managerRouter = require('./routers/manager.router');
const employeeRouter = require('./routers/employee.router');
const ticketRouter = require('./routers/ticket.router');
const {tokenDecorder} = require('ca-webutils/jwt')
const cors = require('cors');
const public_key = fs.readFileSync(path.join(process.cwd(),'keys', 'jwt2.public.key'), 'utf8');


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
    app.use('/api/managers', managerRouter());
    app.use('/api/employees', employeeRouter());
    app.use('/api/tickets', ticketRouter());
    return app; 
}

module.exports = createApp;