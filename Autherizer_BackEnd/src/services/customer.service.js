const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { emit } = require('../repositories/mongoose/models/otp.model');
const { AuthenticationError } = require('ca-webutils/errors');
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false, 
});

class CustomerService{
    constructor(customerRepository, otpRepository){
        this.customerRepository = customerRepository;
        this.otpRepository = otpRepository;
    }

    async getAllCustomers(){
        return await this.customerRepository.getAll();
    } 

    async getCustomerById(id){
        return await this.customerRepository.findOne({customerID: id});
    }
  
    async createCustomer(customer){
        customer.password = await bcrypt.hash(customer.password, 10)
        return await this.customerRepository.create(customer);
    }

    async updateCustomer(id, customerData){
        return await this.customerRepository.update({customerID: id}, customerData);
    }

    async updateByEmail(customerData){
        customerData.password = await bcrypt.hash(customerData.password, 10);
        return await this.customerRepository.update({email: customerData.email}, {password: customerData.password});
    }

    async deleteCustomer(id){
        return await this.customerRepository.remove({customerID: id});
    }

    async login({email, password}){
        let user = await this.customerRepository.getByEmailId({email})
        if(!user) throw new AuthenticationError(`Invalid credentials:${email}`,{email});
        let match = await bcrypt.compare(password,user.password);    
        if(!match) 
            throw new AuthenticationError(`Invalid credentials: ${email}`,{email});
        // user.roles=['customer']
        return this._userInfo(user);
    }

    _userInfo(user){
        return {name:user.name, email:user.email, roles: user.roles, userName: user.customerID}
    }

    async sendEmail(employee){
        console.log(employee);
        
        const emailData = {
            subject: "OTP for Reset Password",
            htmlVal: `
                <p>Dear Customer,</p>
                <p>Someone recently asked for a One Time Password (OTP) to  <b>Reset the Password of Customer Management System</b>.</p>
                <p>Your 6 Digit One-Time Password (OTP) is:</p>
                <p style="font-size: 48px; font-weight: bold; color: blue;">${employee.otp}</p>
                <p><b>Please Note:</b> This OTP is valid only for the next 15 minutes after which it will expire.</p>
                <p><b>Please do not share this OTP with anyone.</b></p>
                <p>Regards,</p>
                <p><b>CodeCrafters</b></p>

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
            console.log(error);
            throw new Error('Failed to send email');
        }
    }

    async otpForValidateEmail({email}){
        let userOTP = await this.otpRepository.findOne({email: email})
        if (userOTP) {
            await this.otpRepository.remove({email})
        }
        console.log("Before User:", email);
        let user = await this.customerRepository.findOne({ email }); 
        console.log(user);
        if (user) {
            console.log("hi");
            throw new Error(`User with email ${email} is already registered`);
        }          
        console.log(email);
        console.log("Guru registered");
        let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Convert to string
        await this.sendEmail({email, otp})
        const encryptedOTP = await CryptoJS.AES.encrypt(otp, process.env.JWT_SECRET).toString();
        console.log(otp,  CryptoJS.AES.decrypt(encryptedOTP, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8));
        
        const data = {
            email: email,
            otp: encryptedOTP
        };
        return await this.otpRepository.create(data);
    }

    async generateOTP({ email }) {
        // Validate email in the otp model

        let userOTP = await this.otpRepository.findOne({email: email})
        if (userOTP) {
            await this.otpRepository.remove({email})
        }
        
        let user = await this.customerRepository.getByEmailId({ email }); 
        if (!user) throw new AuthenticationError(`User with email ${email} not found`, { email });
    
        let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Convert to string
        await this.sendEmail({email, otp})
        const encryptedOTP = await CryptoJS.AES.encrypt(otp, process.env.JWT_SECRET).toString();
        console.log(otp,  CryptoJS.AES.decrypt(encryptedOTP, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8));
        
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

CustomerService._dependencies = ['customerRepository', 'otpRepository']

module.exports = CustomerService;