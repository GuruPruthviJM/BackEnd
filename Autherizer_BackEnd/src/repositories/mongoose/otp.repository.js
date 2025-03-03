const { MongooseRepository } = require("ca-webutils");

class MongooseTicketRepository extends MongooseRepository{
    constructor(model){
        super(model);
    }

    async removeRepo(id={}){
        return await this.model.findOneAndDelete(id);
    }  
} 

MongooseTicketRepository._dependencies = ['otp']

module.exports = MongooseTicketRepository;    