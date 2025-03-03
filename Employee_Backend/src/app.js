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
        origin: 'http://54.166.126.188:7000', // Adjust this if your frontend runs on a different URL or port
        credentials: true,
    };
    app.use(cors(corsOptions));
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(tokenDecorder(public_key, {algorithms: ['RS256']}));
    app.use('/api/employees', employeeRouter())
    return app; 
}

module.exports = createApp; 