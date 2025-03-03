const https = require('https');
const axios = require('axios');
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

    async createTicket(ticket) {
        return await this.ticketRepository.create(ticket);
    }

    async updateTicket(id, ticketData, token) {
        try {
            if (!token) throw new Error('Token required');
            const ticket = await this.ticketRepository.findOne({ ticketId: id });
            if (!ticket) throw new Error('Ticket not found');
            
            const validTransitions = {
                OPEN: 'PENDING',
                PENDING: 'CLOSED'
            };

            const nextStatus = validTransitions[ticket.ticketStatus];
            if (ticketData.ticketStatus && ticketData.ticketStatus !== nextStatus) {
                throw new Error(`Invalid status transition from ${ticket.ticketStatus} to ${ticketData.ticketStatus}`);
            }
            
            if (ticketData.ticketStatus && ticket.ticketStatus !== ticketData.ticketStatus) {
                ticketData.ticketStatusHistory = [
                    ...(ticket.ticketStatusHistory || []),
                    { status: ticketData.ticketStatus, changedAt: new Date() }
                ];
            }
            
            const prevTicketStatus = ticket.ticketStatus;

            const response = await this.ticketRepository.update({ ticketId: id }, ticketData);

            const userResponse = await axios.get(`http://localhost:8080/api/customers/${ticket.customerId}`, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `BEARER ${token}`
                }
            });
            const userEmail = userResponse.data.email;
            if (!userEmail) throw new Error('Customer email not found');
            const emailData = {
                subject: `Your Ticket Status Update for Ticket ID ${ticket.ticketId}`,
                htmlVal: `
                <p>Dear ${ticket.customerId},</p>
                <p>Your ticket has been updated from ${prevTicketStatus} to ${ticketData.ticketStatus} by ${ticket.employeeId}.</p>
                <p>Regards,</p>
                <p>CodeCrafters</p>
                `,
                to: userEmail
            };
            console.log("Sending email with data:", emailData);
            await axios.post(`http://localhost:7000/api/email`, emailData, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // console.log("Guru", ticket.employeeId);
            await axios.get(`http://localhost:8000/api/employees/${ticket.employeeId}/stats`, {
                httpsAgent,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const employee = await axios.get(`http://localhost:8000/api/employees/${ticket.employeeId}`,{
                httpsAgent,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            console.log(employee.data.managerId);
            
            await axios.get(`http://localhost:5000/api/managers/${employee.data.managerId}/stats`, {
                httpsAgent,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            console.log("Guru Pruthvi");
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    

    async deleteTicket(id) {
        return await this.ticketRepository.remove({ ticketId: id });
    }

    async getTicketByEmpId(id){
        return await this.ticketRepository.getTicketByEmpId({employeeId: id});
    }
}

TicketService._dependencies = ['ticketRepository'];

module.exports = TicketService;