const express = require('express');
const path = require('path');
const fs = require('fs');
const employeeRouter = require('./routers/employee.router');
const ticketRouter = require('./routers/ticket.router');
const managerRouter = require('./routers/manager.router');
const adminRouter = require('./routers/admin.router');
const authorizerRouter = require('./routers/authorizer.router');
const customerRouter = require('./routers/customer.router');
const emailRouter = require('./routers/email.router');
const notificationRouter = require('./routers/notification.router');
const { tokenDecorder } = require('ca-webutils/jwt');
const cors = require('cors');

const public_key = fs.readFileSync(
  path.join(process.cwd(), 'keys', 'jwt2.public.key'),
  'utf8'
);

async function createApp() {
    const app = express();
    app.use(express.json());

    // const allowedOrigins = [
    //     'http://18.209.26.169',
    //     'http://18.209.26.169:3000',
    //     'http://18.209.26.169:7000',
    //     'http://18.209.26.169:8000',
    //     'http://18.209.26.169:8080',
    //     'http://18.209.26.169:5000',
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

    app.use(express.static(path.join(process.cwd(), 'public')));
    app.use(tokenDecorder(public_key, { algorithms: ['RS256'] }));

    // Mount routers
    app.use('/api/employees', employeeRouter());
    app.use('/api/tickets', ticketRouter());
    app.use('/api/managers', managerRouter());
    app.use('/api/admins', adminRouter());
    app.use('/api/authorizers', authorizerRouter());
    app.use('/api/customers', customerRouter());
    app.use('/api/email', emailRouter());
    app.use('/api/notifications', notificationRouter());

    return app;
}

module.exports = createApp;
