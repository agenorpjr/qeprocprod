'use server'
import db from "./db/db"
import { zodschema } from "./zodschema"
import bcrypt from 'bcryptjs'

const signUp = async (signupdata: any) => {

    const password = signupdata.password
    const password2 = signupdata.password2
    if (password !== password2) {
        return {
            success: false,
            message: "Senhas não conferem."
        }
    }
    try {
        const name = signupdata.name
        const email = signupdata.email
        const role = signupdata.role
        const approver = signupdata.approver
        const validatedData = zodschema.parse({ email, password })
        const hashPwd = await bcrypt.hash(validatedData.password, 10)

        await db.user.create({
            data: {
                name: name,
                email: validatedData.email.toLowerCase(),
                password: hashPwd,
                role: role,
                approver: approver
            }
        })
        return {
            success: true,
            message: "Usuário Criado com Sucesso",
        };
    } catch (error) {
        return {
            success: false,
            message: error,
        };
    }
}

export { signUp }