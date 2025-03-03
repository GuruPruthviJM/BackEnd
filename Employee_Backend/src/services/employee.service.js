const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Consider enabling this in production
});
class EmployeeService {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    async getAllEmployees() {
        return await this.employeeRepository.getAll();
    }

    async getEmployeeById(id) {
        return await this.employeeRepository.findOne({ employeeId: id });
    }

    async createEmployee(employee) {
        return await this.employeeRepository.create(employee);
    }

    async updateEmployee(id, employeeData) {
        return await this.employeeRepository.update({ employeeId: id }, employeeData);
    }

    async deleteEmployee(id) {
        return await this.employeeRepository.remove({ employeeId: id });
    }

    async getCollegues(id){
        const employee = await this.employeeRepository.findOne({ employeeId: id});
        if(!employee)
            throw new Error('Employee not found');
        return await this.employeeRepository.findAll({ managerId: employee.managerId });
    }

    async calculateAverageResponseTime(tickets) {
        let totalResponseTime = 0;
        let count = 0;
    
        tickets.forEach(ticket => {
            if (ticket.ticketStatusHistory.length > 0) {
                const openStatus = ticket.ticketStatusHistory.find(status => status.status === "OPEN");
                const nextStatus = ticket.ticketStatusHistory.find(status => status.status === "PENDING");
                if (openStatus && nextStatus) {
                    const openTime = new Date(openStatus.changedAt).getTime();
                    const nextTime = new Date(nextStatus.changedAt).getTime();
                    const responseTime = (nextTime - openTime) / 1000; 
                    totalResponseTime += responseTime;
                    count++;
                }
            }
        });
        return count > 0 ? (totalResponseTime / count) : 0;
    }

    async calculateAverageResolutionTime(tickets){
        let totalResolutionTime = 0;
        let count = 0;

        tickets.forEach(ticket => {
            if (ticket.ticketStatusHistory.length > 1) {
                const openStatus = ticket.ticketStatusHistory.find(status => status.status === "OPEN");
                const closedStatus = ticket.ticketStatusHistory.find(status => status.status === "CLOSED");
                if (openStatus && closedStatus) {
                    const openTime = new Date(openStatus.changedAt).getTime();
                    const nextTime = new Date(closedStatus.changedAt).getTime();
                    const responseTime = (nextTime - openTime) / 1000; 
                    totalResolutionTime += responseTime;
                    count++;
                }
            }
        });
        console.log(count);
        return count > 0 ? (totalResolutionTime / count) : 0;
    }

    async getStats(id, token){
        const employee = await this.employeeRepository.findOne({ employeeId: id});
        if(!employee)
            throw new Error('Employee not found');
        const response = await axios.get(`http://localhost:8000/api/employees/${employee.employeeId}/tickets`, {
            httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const ticketsAssignedToEmployee = response.data
        employee.avgResolutionTime=await this.calculateAverageResponseTime(ticketsAssignedToEmployee);
        employee.avgResponseTime=await this.calculateAverageResolutionTime(ticketsAssignedToEmployee);
        // console.log("Guru", ticketsAssignedToEmployee, employee.avgResolutionTime, employee.avgResponseTime);
        await this.updateEmployee(employee.employeeId, employee)
        return {employeeId: employee.employeeId, avgResponseTime: employee.avgResolutionTime, avgResolutionTime: employee.avgResponseTime}
    }
}

EmployeeService._dependencies = ['employeeRepository'];

module.exports = EmployeeService;
