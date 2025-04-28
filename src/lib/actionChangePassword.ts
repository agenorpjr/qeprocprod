'use server'
import db from "./db/db"
import { zodschema } from "./zodschema"
import bcrypt from 'bcryptjs'

export default async function actionChangePassword(data: any) {
    
    const password = data.password
    const hashPwd = await bcrypt.hash(password, 10)
    
    try {
        const upuser = async () => {
            await db.user.update({
            where: {
                id: data.user_id
            },
            data: {
                password: hashPwd,
            }
        })}
        await upuser()
    } catch (err) {}
    
 
}