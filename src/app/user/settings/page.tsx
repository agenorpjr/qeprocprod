'use client'

import {
    Button,
    Container,
    Group,
    Paper,
    PasswordInput,
    Text,
    Title,
} from '@mantine/core';

import classes from "./settings.module.css"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import actionChangePassword from '@/lib/actionChangePassword';
import SignOutF from '@/lib/actionSignout';

export default function UserSettings() {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'unauthenticated') {
        router.push('/')
    }

    const [password1, setPassword1] = useState()
    const [password2, setPassword2] = useState()

    const changePwd =  async () => {
        if (password1 !== password2) {
            notifications.show({
                title: "Mudar Senha",
                message: "Senhas Não Conferem",
                position: 'top-center',
                color: 'red',
            })
            throw new Error
        }

        if (password1.length < 6) {
            notifications.show({
                title: "Mudar Senha",
                message: "Senha Deve Conter no mínimo 6 caracteres",
                position: 'top-center',
                color: 'red',
            })
            throw new Error
        }
        const data = {
            password: password1,
            user_id: session?.user?.id
        }
        const cpwd = await actionChangePassword(data)
        .then(async () => {
            notifications.show({
                title: "Mudar Senha",
                message: "Senha alterada com sucesso!",
                position: 'top-center',
                color: 'red',
            })
            await SignOutF()
        })
    }

    return (
        <Container size={460} my={30}>
            <Title className={classes.title} ta="center">
                Mudar Senha
            </Title>
            <Text c="dimmed" fz="sm" ta="center">
                Entre com os dados para alterar a senha
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <PasswordInput
                    label="Nova Senha"
                    type='password'
                    required
                    placeholder='Digite a senha atual'
                    value={password1}
                    onChange={(event) => setPassword1(event.currentTarget.value)}
                    mb={10}
                />
                <PasswordInput
                    label="Repita a Nova Senha"
                    type='password'
                    required
                    placeholder='Digite a senha atual'
                    value={password2}
                    onChange={(event) => setPassword2(event.currentTarget.value)}

                />
                <Group justify="space-between" mt="lg" className={classes.controls}>
                    <Button className={classes.control} fullWidth mt={10}
                    onClick={changePwd}
                    >Alterar Senha</Button>
                </Group>
            </Paper>
        </Container>
    );
}