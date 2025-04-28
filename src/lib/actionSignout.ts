'use server'
import { redirect } from "next/navigation"
import { signOut } from "./auth"

export default async function SignOutF() {
    try {
        await signOut().then(() => {
            redirect('/sign-in')
        })
    } catch (erro) {

    } finally {
        redirect("/sign-in")
    }

}