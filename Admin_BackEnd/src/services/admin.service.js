const bcrypt = require('bcrypt');
class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }

    async getAllAdmins() {
        return await this.adminRepository.getAll();
    }

    async getAdminById(id) {
        return await this.adminRepository.findOne({ ADMIN_ID: id });
    }

    async createAdmin(admin) {
        admin.password = await bcrypt.hash(admin.password, 10);
        return await this.adminRepository.create(admin);
    }

    async updateAdmin(id, adminData) {
        return await this.adminRepository.update({ ADMIN_ID: id }, adminData);
    }

    async deleteAdmin(id) {
        return await this.adminRepository.remove({ ADMIN_ID: id });
    }
}

AdminService._dependencies = ['adminRepository'];

module.exports = AdminService;
