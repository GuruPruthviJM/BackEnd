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
    const corsOptions = {
        origin: 'http://54.166.126.188', // Ensure this matches your frontend origin
        credentials: true, // Allow credentials (cookies, authorization headers)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed request methods
        allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization' // Allowed headers
    };
 
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(tokenDecorder(public_key, {algorithms: ['RS256']}));
    app.use('/api/managers', managerRouter());
    app.use('/api/employees', employeeRouter());
    app.use('/api/tickets', ticketRouter());
    return app; 
}

module.exports = createApp;