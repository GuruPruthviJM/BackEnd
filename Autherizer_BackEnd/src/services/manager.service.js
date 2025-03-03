const { AuthenticationError } = require("ca-webutils/errors");
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js')
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
});

class ManagerService {
    constructor(managerRepository, otpRepository) {
        this.managerRepository = managerRepository;
        this.otpRepository = otpRepository;
    }

    async getAllManagers() {
        return await this.managerRepository.getAll();
    }

    async getManagerById(id) {
        return await this.managerRepository.findOne({ Manager_ID: id });
    }

    async sendEmail(employee, subject, htmlValue){
        const emailData = {
            subject: subject||`Welcome to Brillio`,
            htmlVal: htmlValue||`
            <p>Dear ${employee.name}</p>
            <p>Welcome to Brillio! We're excited to have you join our team. Please find below your login emailId and reset the password using forget password:</p>
            <p>Email: <b>${employee.email}</b></p>
            <p>Thank you for joining Brillio, and we look forward to working with you!</p>
            <p>Regards,<p>
            CodeCrafters
            `,
            to: employee.email
        }
        
        try{
            axios.post(`http://localhost:7000/api/email`, emailData, {
                httpsAgent,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        }catch(error){
            throw new Error('Failed to send email');
        }
    }

    async createManager(manager) {
        const password = manager.password
        manager.password = await bcrypt.hash(manager.password, 10);
        const responce = await this.managerRepository.create(manager);
        if(!responce.message){
            manager.password=password
            await this.sendEmail(manager)
        }
        return responce;
    }

    async updateManager(id, managerData) {
        return await this.managerRepository.update({ Manager_ID: id }, managerData);
    }

    async updateByEmail(customerData){
            customerData.password = await bcrypt.hash(customerData.password, 10);
            return await this.managerRepository.update({email: customerData.email}, {password: customerData.password});
        }

    async deleteManager(id) {
        return await this.managerRepository.remove({ Manager_ID: id });
    }

    async login({email, password}){
        let user = await this.managerRepository.getByEmailId({email})
        if(!user) throw new AuthenticationError(`Invalid credentials:${email}`,{email});
        let match = await bcrypt.compare(password,user.password);    
        if(!match) 
            throw new AuthenticationError(`Invalid credentials: ${email}`,{email});
        return this._userInfo(user);
    }

    _userInfo(user){
        return {name:user.name, email:user.email, roles: user.roles, userName: user.managerId}
    }

    async generateOTP({ email }) {
        // Validate email in the otp model

        let userOTP = await this.otpRepository.findOne({email})
        if (userOTP) {
            await this.otpRepository.remove({email})
        }
        
        let user = await this.managerRepository.findOne({ email });
        if (!user) throw new AuthenticationError(`User with email ${email} not found`, { email });

        let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Convert to string
        const encryptedOTP = await CryptoJS.AES.encrypt(otp, process.env.JWT_SECRET).toString();
        console.log(otp,  CryptoJS.AES.decrypt(encryptedOTP, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8));
        const dataForEmail = `
            <p>Dear ${user.name},</p>
            <p>Someone recently asked for a One Time Password (OTP) to  <b>Reset the Password of Customer Management System</b>.</p>
            <p>Your 6 Digit One-Time Password (OTP) is:</p>
            <p style="font-size: 48px; font-weight: bold; color: blue;">${otp}</p>
            <p><b>Please Note:</b> This OTP is valid only for the next 15 minutes after which it will expire.</p>
            <p><b>Please do not share this OTP with anyone.</b></p>
            <p>Regards,</p>
            <p><b>CodeCrafters</b></p>`;
        await this.sendEmail(user, "Request for OTP", dataForEmail)
        const data = {
            email: user.email,
            otp: encryptedOTP
        };
        return await this.otpRepository.create(data);
    }
    
        async verifyOTP({ email, otp }) {
            let user = await this.otpRepository.findOne({ email });
            if (!user) throw new AuthenticationError(`User with email ${email} not found`, { email });
            const decryptedOTP = await CryptoJS.AES.decrypt(user.otp, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8);
            if (decryptedOTP!= otp) throw new AuthenticationError(`Invalid OTP`, { email });
            await this.otpRepository.remove(email);
            return {
                status: 200,
                message: "OTP verification successful",
                data: { email }
            };
        }
}

ManagerService._dependencies = ['managerRepository', 'otpRepository'];

module.exports = ManagerService; 
