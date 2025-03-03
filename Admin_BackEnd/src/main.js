const {httpx} = require('ca-webutils')
const mongoose = require('mongoose');
require('./config')
const createApp = require('./app');

async function main(){
    const app = await createApp();
    httpx.runApp({
        protocol:'http',
        requestHandler:app, 
        initializer: async()=>{
            await mongoose.connect(process.env.MONGODB_URL);
            console.log('connected to database server')
        }
    });
}  

main();