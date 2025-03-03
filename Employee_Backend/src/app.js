const express = require('express');
const path = require('path');
const fs = require('fs');
const employeeRouter = require('./routers/employee.router')
const public_key = fs.readFileSync(path.join(process.cwd(),'keys', 'jwt2.public.key'), 'utf8');
const {tokenDecorder} = require('ca-webutils/jwt')
const cors = require('cors')

async function createApp(){
    const app = express();
    app.use(express.json());
    const corsOptions = {
        origin: 'http://18.209.26.169', // Ensure this matches your frontend origin
        credentials: true, // Allow credentials (cookies, authorization headers)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed request methods
        allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization' // Allowed headers
    };
 
    app.use(cors(corsOptions));
 
    // Handle preflight (OPTIONS) requests globally
    app.options('*', cors(corsOptions));
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(tokenDecorder(public_key, {algorithms: ['RS256']}));
    app.use('/api/employees', employeeRouter())
    return app; 
}

module.exports = createApp; 