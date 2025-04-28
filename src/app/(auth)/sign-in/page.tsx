import {
    Button,
    Paper,
    PasswordInput,
    TextInput,
    Title,
} from '@mantine/core';
import classes from './signin.module.css';
import { auth, signIn } from "@/lib/auth";
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';

async function action(formData: FormData) {
    "use server"
    try {
        formData.append('redirect', 'false');
        
        await signIn('credentials', formData)
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
    } finally {
        redirect("/")
    }
    
}

export default async function SigninPage() {

    const session = await auth()

    if (session) {
        redirect('/')
    }

    return (
        <div className={classes.wrapper}>
            <form action={action}>
                <Paper className={classes.form} radius={0} p={30}>
                    <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
                        Bem Vindo ao Sistema de Compras Quanta!
                    </Title>
                    <TextInput label="Email" placeholder="email@quanta.works" size="md" name="email" />
                    <PasswordInput label="Senha" placeholder="Insira sua senha" mt="md" size="md" name="password" />

                    <Button fullWidth mt="xl" size="md" type="submit">
                        Entrar
                    </Button>
                </Paper>
            </form>
        </div>
    );
}