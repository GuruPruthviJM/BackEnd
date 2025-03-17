const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Consider enabling this in production
});

class ManagerService {
    constructor(managerRepository) {
        this.managerRepository = managerRepository;
    }

    async getAllManagers() {
        return await this.managerRepository.getAll();
    }

    async getManagerById(id) {
        return await this.managerRepository.findOne({ managerId: id });
    }

    async createManager(manager) {
        return await this.managerRepository.create(manager);
    }

    async updateManager(id, managerData) {
        return await this.managerRepository.update({ managerId: id }, managerData);
    }

    async deleteManager(id) {
        return await this.managerRepository.remove({ managerId: id });
    }

    async getStatusForManager(id,token){
        const manager = await this.getManagerById(id)
        if(!manager)
            throw new Error('Manager not found')
        const response = await axios.get(`http://localhost:5000/api/managers/${id}/collegue`, {
            httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const getAllEmployeeUnderManager=response.data
        if(!getAllEmployeeUnderManager)
            throw new Error('Could not find any employee under manager')
        let responseTime=0
        let resolutionTime=0
        getAllEmployeeUnderManager.forEach(employee => {
            responseTime+=employee.avgResponseTime||0
            resolutionTime+=employee.avgResolutionTime||0
        });
        const numOfEmployees=getAllEmployeeUnderManager.length
        let avgResolutionTime=resolutionTime/numOfEmployees
        let avgResponseTime=responseTime/numOfEmployees
        manager.avgResolutionTime=avgResolutionTime
        manager.avgResponseTime=avgResponseTime
        await this.updateManager(id, manager)
        return {
            managerId: manager.managerId,
            numOfEmployees,
            avgResolutionTime,
            avgResponseTime
        }
    }
}

ManagerService._dependencies = ['managerRepository'];

module.exports = ManagerService; 
