const axios = require('axios');
const https = require('https');
const bcrypt = require('bcrypt');


const httpsAgent = new https.Agent({
    rejectUnauthorized: false,  
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
        try{
            const response = await axios.post(`http://localhost:7000/api/employees`, employee, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return response.data;
        }catch(error){
            throw new Error(error?.response?.data?.message||error);
        }
    }

    async updateEmployee(id, employeeData, empId) {
        try{
            const employee = await this.getEmployeeById(empId);
            if(!employee)
                throw new Error('Employee not found');
            const emailData = {
                subject: "Your Details As been Updated",
                htmlVal: `
                <p>Dear Employee,</p>
                <p>Your profile has been updated by admin</p>
                <p>Regards</p>
                <p>CodeCrafters</p>
                `,
                to: employee.email||"gurupruthvi61@gmail.com"
            }
            if(employeeData.password)
                employeeData.password = await bcrypt.hash(employeeData.password, 10);
            await axios.post(`http://localhost:7000/api/email`, emailData, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log(employeeData);
            return await this.employeeRepository.update({ employeeId: empId }, employeeData);
        }catch(error){
            throw new Error(error?.response?.data?.message||error);
        }
    }

    async deleteEmployee(id) {
        try{
            const employee = await this.getEmployeeById(id);
            if(!employee)
                throw new Error('Employee not found');
            const emailData = {
                subject: "Your Account as been Deactivated",
                htmlVal: `
                <p>Dear ${employee.name},</p>
                <p>Your profile has been Deactivated by Admin.</p>
                <p>Regards</p>
                <p>CodeCrafters</p>
                `,
                to: employee.email
            }
            const response = await this.employeeRepository.deleteData(employee?._id);
            await axios.post(`http://localhost:7000/api/email`, emailData, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return response
        }catch(error){
            throw new Error(error?.response?.data?.message||error);
        }
    }
}

EmployeeService._dependencies = ['employeeRepository'];

module.exports = EmployeeService;
