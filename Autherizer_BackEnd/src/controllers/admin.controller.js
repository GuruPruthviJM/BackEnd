const { injector, jwt } = require('ca-webutils')
const fs = require('fs');
const path = require('path');
const privateKey = fs.readFileSync(path.join(process.cwd(),'keys','jwt2.private.key'),'utf-8');


const adminController = () => {
    const adminService = injector.getService('adminService')

    const getAllAdmins = async () => {
        return await adminService.getAllAdmins()
    }

    const getAdminById = async ({ id }) => {
        return await adminService.getAdminById(id)
    }

    const addAdmin = async ({ body }) => {
        return await adminService.createAdmin(body)
    }

    const updateAdmin = async ({ body, id }) => {
        return await adminService.updateAdmin(id, body)
    }

    const deleteAdmin = async ({ id }) => {
        return await adminService.deleteAdmin(id)
    }

    const loginAdmin = async ({body}) => {
        let user = await adminService.login(body);
        if(body.aud)
            user.aud=body.aud;
        if(body.sub)
            user.sub=user[body.sub];
        let token = await jwt.createToken(user,privateKey,{algorithm: 'RS256'},body.claims);
        return {token,user}
    }

    const currentAdminInfo = async ({request})=>{        
        return request.token;
    }

    return {
        getAllAdmins,
        getAdminById,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        loginAdmin,
        currentAdminInfo
    }
}

module.exports = adminController
