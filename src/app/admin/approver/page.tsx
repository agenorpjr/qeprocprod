'use client'
import { IconEraser } from '@tabler/icons-react';
import {
    ActionIcon,
    Button,
    Container,
    Flex,
    Group,
    NativeSelect,
    Paper,
    Table,
    Text,
    Title,
} from '@mantine/core';
import classes from './approver.module.css';
import { useEffect, useState } from 'react';
import { getUsers, updateApprover } from '@/lib/orders/getOrderData';
import Loading from '@/app/loading';

export default function Approver() {
    const [userApprover, setUsersApprover] = useState([])
    const [approvers, setApprovers] = useState([])
    const [value, setValue] = useState('')

    const setApprover = () => {
        userApprover.map(async (item) => {
            if (value === item.value) {
                await updateApprover({
                    id: value,
                    approver: 1
                })

            }
        })
        upData()
    }

    const eraseApprover = (data: any) => {
        const ea = async () => {
            await updateApprover({
                id: data,
                approver: 0
            })
        }
        ea()
        upData()
    }

    const upData = async () => {
        const res = await getUsers()
            let values = []
            let app = []
            res.map((item) => {
                values.push({
                    label: item.name,
                    value: item.id
                })
                if (item.approver === 1) {
                    app.push({
                        name: item.name,
                        id: item.id
                    })
                }
            })
            setUsersApprover(values)
            setApprovers(app)
    }

    useEffect(() => {
        const users = async () => {
            const res = await getUsers()
            let values = []
            let app = []
            res.map((item) => {
                values.push({
                    label: item.name,
                    value: item.id
                })
                if (item.approver === 1) {
                    app.push({
                        name: item.name,
                        id: item.id
                    })
                }
            })
            setUsersApprover(values)
            setApprovers(app)
        }
        users()
    }, [])

    const rows = approvers.map((element) => (
        
            <Table.Tr key={element.name}>
                <Flex justify='space-between'>
                <Table.Td>{element.name}  
                </Table.Td>
                <ActionIcon variant="filled" aria-label="Deletar" color='red'>
                        <IconEraser style={{ width: '70%', height: '70%' }} stroke={1.5} onClick={() => eraseApprover(element.id)}/>
                    </ActionIcon>
                </Flex>
            </Table.Tr>
        
    ));

    if (userApprover.length === 0) return <Loading />

    return (
        <Container size={460} my={30}>
            <Title className={classes.title} ta="center">
                Configurar Aprovadores
            </Title>
            <Text c="dimmed" fz="sm" ta="center">
                Selecione um usuário como aprovador
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <NativeSelect
                    data={userApprover}
                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                />
                <Group justify="space-between" mt="lg" className={classes.controls}>
                    <Button className={classes.control} fullWidth onClick={setApprover}>Confirmar</Button>
                </Group>
            </Paper>


            <Title className={classes.subtitle} ta="center" mt="xl">
                Aprovadores
            </Title>
            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nome</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}