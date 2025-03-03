const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
});

class TicketService {
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    async getAllTickets() {
        return await this.ticketRepository.getAll();
    }

    async getTicketById(id) {
        return await this.ticketRepository.findOne({ ticketId: id });
    }

    async createTicket(ticket, token) { 
        try {
            const customer = await axios.get(`http://localhost:8080/api/customers/${ticket.customerId}`,{
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!customer) {
                throw new Error('Customer not found');
            }
            
            ticket.latitude=customer.data.latitude
            ticket.longitude=customer.data.longitude
            const allManagers = await axios.get('http://localhost:5000/api/managers', {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const manager = allManagers.data.find(manager => manager.department === ticket.department);
            // console.log(manager);
            if (!manager) {
                throw new Error('No manager found in the specified department');
            }
            const employeeTicketCount = await axios.get(
                `http://localhost:5000/api/managers/${manager.managerId}/collegue/ticketCount`,{
                    httpsAgent,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!employeeTicketCount.data.length) {
                throw new Error('No employees found to assign the ticket');
            }
            employeeTicketCount.data.sort((a, b) => a.ticketCount - b.ticketCount);
            console.log(employeeTicketCount.data[0].employeeId);
            
            ticket.employeeId = employeeTicketCount.data[0].employeeId;
            console.log(ticket);
            
            return await this.ticketRepository.create(ticket);
        } catch (error) {
            throw error; 
        }
    }

    async updateTicket(id, ticketData) {
        const ticket = await this.ticketRepository.findOne({ticketId: id})
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        if(ticketData.ticketStatus && ticket.ticketStatus!==ticketData.ticketStatus) 
            ticketData.ticketStatusHistory=ticket.ticketStatusHistory.concat({ status: ticketData.ticketStatus, changedAt: new Date() });
        return await this.ticketRepository.update({ ticketId: id }, ticketData);
    }

    async deleteTicket(id) {
        return await this.ticketRepository.remove({ ticketId: id });
    }

    async getTicketByCustId(id) {
        return await this.ticketRepository.getTicketByCustId({ customerId: id });
    }
}

TicketService._dependencies = ['ticketRepository'];

module.exports = TicketService;
