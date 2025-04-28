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
import classes from './purchaser.module.css';
import { useEffect, useState } from 'react';
import { getUsers, updatePurchaser } from '@/lib/orders/getOrderData';
import Loading from '@/app/loading';

export default function Purchaser() {
    const [userPurchaser, setUsersPurchaser] = useState([])
    const [purchasers, setPurchasers] = useState([])
    const [value, setValue] = useState('')

    const setPurchaser = () => {
        userPurchaser.map(async (item) => {
            console.log('aqui', item)
            if (value === item.value) {
                await updatePurchaser({
                    id: value,
                    purchaser: 1
                })

            }
        })
        upData()
    }

    const erasePurchaser = (data: any) => {
        const ea = async () => {
            await updatePurchaser({
                id: data,
                purchaser: 0
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
                if (item.purchaser === 1) {
                    app.push({
                        name: item.name,
                        id: item.id
                    })
                }
            })
            setUsersPurchaser(values)
            setPurchasers(app)
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
                if (item.purchaser === 1) {
                    app.push({
                        name: item.name,
                        id: item.id
                    })
                }
            })
            setUsersPurchaser(values)
            setPurchasers(app)
        }
        users()
    }, [])

    const rows = purchasers.map((element) => (
        
            <Table.Tr key={element.name}>
                <Flex justify='space-between'>
                <Table.Td>{element.name}  
                </Table.Td>
                <ActionIcon variant="filled" aria-label="Deletar" color='red'>
                        <IconEraser style={{ width: '70%', height: '70%' }} stroke={1.5} onClick={() => erasePurchaser(element.id)}/>
                    </ActionIcon>
                </Flex>
            </Table.Tr>
        
    ));

    if (userPurchaser.length === 0) return <Loading />

    return (
        <Container size={460} my={30}>
            <Title className={classes.title} ta="center">
                Configurar Compradores
            </Title>
            <Text c="dimmed" fz="sm" ta="center">
                Selecione um usuário como comprador
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                <NativeSelect
                    data={userPurchaser}
                    value={value}
                    onChange={(event) => setValue(event.currentTarget.value)}
                />
                <Group justify="space-between" mt="lg" className={classes.controls}>
                    <Button className={classes.control} fullWidth onClick={setPurchaser}>Confirmar</Button>
                </Group>
            </Paper>


            <Title className={classes.subtitle} ta="center" mt="xl">
                Compradores
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