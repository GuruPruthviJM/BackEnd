const express = require('express');
const path = require('path');
const fs = require('fs');
const employeeRouter = require('./routers/employee.router')
const ticketRouter = require('./routers/ticket.router');
const managerRouter = require('./routers/manager.router');
const adminRouter = require('./routers/admin.router');
const { tokenDecorder } = require('ca-webutils/jwt');
const cors = require('cors');
const public_key = fs.readFileSync(path.join(process.cwd(),'keys', 'jwt2.public.key'), 'utf8');
async function createApp(){
    const app = express();
    app.use(express.json());
    const corsOptions = {
        origin: 'http://54.166.126.188', // Adjust this if your frontend runs on a different URL or port
        credentials: true,
    };
    app.use(cors());
    app.use(express.static(path.join(process.cwd(), 'public')))
    app.use(tokenDecorder(public_key, {algorithms: ['RS256']}));
    app.use('/api/employees', employeeRouter())
    app.use('/api/tickets', ticketRouter()) 
    app.use('/api/managers', managerRouter())
    app.use('/api/admins', adminRouter())
    return app;  
}

module.exports = createApp; 