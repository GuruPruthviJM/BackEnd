const express = require('express');
const {expressx} = require('ca-webutils');
const customerController = require('../controllers/customer.controller');
const {authenticate,authorize} = require('ca-webutils/jwt');

const createRouter = () => {
    const router = express.Router();
    let {routeHandler} = expressx;
    let controller = customerController() 
 
    router
     .route('/login')
     .post(routeHandler(controller.loginCustomer));

    router
     .route('/')
     .get(authenticate, routeHandler(controller.getAllCustomer))
     .post(routeHandler(controller.addCustomer));   

    router
     .route('/:id')
     .get(authenticate, routeHandler(controller.getCustomerById))
     .put(authenticate, routeHandler(controller.updateCustomer))
     .delete(authenticate, routeHandler(controller.deleteCustomer));

     router
     .route('/current')
     .get(authenticate,routeHandler(controller.currentUserInfo))

    return router;
}

module.exports = createRouter;