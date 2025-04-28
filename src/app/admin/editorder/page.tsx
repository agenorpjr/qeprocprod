'use client'
import {
    Card,
    Text,
    Grid,
    Button,
    Divider,
    Group,
    Box,
    Stack,
    Flex,
    useCombobox,
    Combobox,
    InputBase,
    Input,
    Title,
    NativeSelect,
    Anchor,
} from "@mantine/core"

import 'dayjs/locale/pt-br';

import { DataTable } from 'mantine-datatable';

import classes from './editorder.module.css'
import { useSession } from "next-auth/react";
import { redirect, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getApproverByUserId, getOrderById, getUserById, getPurchasers, updateOrderByAdmin, getUserByName } from "@/lib/orders/getOrderData";

import { notifications } from "@mantine/notifications";
import Loading from "@/app/loading";
import EditProductOrder from "@/components/EditProductOrder/page";

export default function EditOrdertPage() {

    const { data: session } = useSession()
    if (session?.user?.role === "user") {
        redirect("/user/dashboard")
    }
    const searchParams = useSearchParams()
    const dId = searchParams.get('dId')
    const router = useRouter()
    const path = usePathname()

    const [showData, setShowData] = useState(false)
    const [companyName, setCompanyName] = useState('')
    const [userName, setUserName] = useState('')
    const [approverName, setApproverName] = useState('')

    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)

    const [orderDate, setOrderDate] = useState<Date | null>(null)
    const [deliveryAddress, setDeliveryAddess] = useState('')
    const [costCenter, setCostCenter] = useState('')
    const [projectName, setProjectName] = useState('')

    const [orderNumber, setOrdertNumber] = useState("")
    const [orderId, setOrdertId] = useState(0)

    const [dataTable, setdataTable] = useState([])
    const [purchaser, setPurchaser] = useState<string | null>(null);
    const [purchasers, setPurchasers] = useState([])

    const [orderStatus, setOrderStatus] = useState('')

    const getData = async () => {

        const res = await getOrderById(parseInt(dId))
        const user = await getUserById(res?.user_id)
        const app = await getApproverByUserId(res?.approver_id)
        const purc = await getPurchasers()
        const purcname = await getUserById(res?.purchaser)
        console.log('fodaaa', res)
        setPurchasers(purc)
        setPurchaser(purcname.name)
        setApproverName(app?.name)
        setUserName(user?.name)
        setCompanyName(res?.companies?.company)
        setDeliveryAddess(res?.delivery_address)
        setDeliveryDate(res?.delivery_at)
        setOrderDate(res?.created_at)
        setOrdertNumber(res?.order_number)
        setOrdertId(res?.order_id)
        setdataTable(res?.order_products_list)
        setCostCenter(res?.cost_centers ? res?.cost_centers?.cost_center : '')
        setProjectName(res?.projects?.project ? res?.projects.project : '')
        setOrderStatus(res?.status)
        setShowData(true)
    }

    useEffect(() => {
        getData()
    }, [])

    const purchasercombobox = useCombobox({
        onDropdownClose: () => purchasercombobox.resetSelectedOption(),
    });

    const optionspurchaser = purchasers.map((item) => (
        <Combobox.Option value={item.name} key={item.id}>
            {item.name}
        </Combobox.Option>
    ));

    const UpdataProduct = async () => {
        const dt = await getOrderById(orderId)
        setdataTable(dt?.order_products_list)

    }

    const updateDataOrder = async () => {
        const purc = await getUserByName(purchaser)
        const data = {
            order_id: orderId,
            status: orderStatus,
            purchaser: purc?.id,
        }

        const uporder = await updateOrderByAdmin(data)
    }

    if (!showData) return <Loading />

    return (
        <Stack w="100%" justify="center">
            <Card shadow="sm" padding='sm' className={classes.wcard}>
                <Card.Section p="sm" className={classes.card}>
                    <Group justify="space-between">

                        <Text fw={900} size="md" className={classes.title} >
                            Requisição de Materiais de {userName}
                        </Text>
                        <Text fw={900} size="md" className={classes.title}>
                            Data da Solicitação:  {new Date(orderDate).toLocaleDateString()}
                        </Text>
                    </Group>
                </Card.Section>
                <Group justify="space-between">
                    <Text fw={900} size="lg" mt="md" mb={10} c="blue">
                        Dados da requisição - Nº {orderNumber}
                    </Text>
                </Group>


                <Card shadow="sm" padding='sm' mb={20} withBorder className={classes.cardinfo}>
                    <Grid>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Empresa:</Title>
                                <Text>{companyName}</Text>
                            </Flex>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, xs: 3 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Centro de Custo:</Title>
                                <Text>{costCenter}</Text>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Projeto:</Title>
                                <Text>{projectName}</Text>
                            </Flex>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Endereço de Entrega:</Title>
                                <Text>{deliveryAddress}</Text>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Entrega solicitada:</Title>
                                <Text>{new Date(deliveryDate).toLocaleDateString()}</Text>
                            </Flex>

                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>
                            <Flex justify="flex-start" align='center' gap='md'>
                                <Title order={6}>Aprovador:</Title>
                                <Text>{approverName}</Text>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Card>

                <Grid>
                    <Grid.Col span={{ base: 12, xs: 4 }}>
                        <Combobox
                            store={purchasercombobox}
                            withinPortal={false}
                            onOptionSubmit={(val) => {
                                setPurchaser(val);
                                purchasercombobox.closeDropdown();
                            }}
                        >
                            <Combobox.Target>
                                <InputBase
                                    className={classes.boxtitle}
                                    label="Comprador"
                                    component="button"
                                    type="button"
                                    pointer
                                    rightSection={<Combobox.Chevron />}
                                    onClick={() => purchasercombobox.toggleDropdown()}
                                    rightSectionPointerEvents="none"
                                >
                                    {purchaser || <Input.Placeholder>Selecione</Input.Placeholder>}
                                </InputBase>
                            </Combobox.Target>

                            <Combobox.Dropdown>
                                <Combobox.Options className={classes.boxcontent}>{optionspurchaser}</Combobox.Options>
                            </Combobox.Dropdown>
                        </Combobox>

                    </Grid.Col>
                    <Grid.Col span={{ base: 12, xs: 4 }}>
                        <NativeSelect
                            value={orderStatus}
                            label='Status'
                            className={classes.boxtitle}
                            onChange={(event) => setOrderStatus(event.currentTarget.value)}
                            data={[
                                'Em Cotação',
                                'Aprov. Financeira',
                                'Análise Usuário',
                                'Pedido Confirmado',
                                'Pedido Entregue',
                                'Cancelada',
                                'Em Aprovação',
                                'Requisição Aprovada'
                            ]}
                        />
                    </Grid.Col>
                </Grid>
                <Divider mt={30} />
                <Grid>
                    <Grid.Col span={{ base: 12, xs: 6 }}>
                        <Flex gap='md' mt={10}>
                            <Text className={classes.subtitle} mt={1}>
                                Lista de Materiais
                            </Text>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <DataTable
                            columns={[
                                {
                                    accessor: 'products.description',
                                    title: 'Produtos',
                                    width: "30%"
                                },
                                {
                                    accessor: 'measures.measure',
                                    title: "Medida",
                                    width: "5%"
                                },
                                {
                                    accessor: 'quantity',
                                    title: 'Qtde',
                                    width: "5%"
                                },
                                {
                                    accessor: 'suppliers.supplier',
                                    title: "Fornecedor",
                                    width: "20%"
                                },
                                {
                                    accessor: 'purchase_number',
                                    title: "Nº Pedido",
                                    width: "20%"
                                },
                                {
                                    accessor: 'amount',
                                    title: "Valor",
                                    width: "20%",
                                    render: (record) => (
                                        <Flex justify='flex-start' align='center'>
                                            <Text size="sm">
                                                {record.amount ? `R$ ${record.amount.toString().replace('.', ',')}` : ''}
                                            </Text>
                                        </Flex>
                                    )
                                },
                                {
                                    accessor: 'delivery_expected',
                                    title: "Entrega Prevista",
                                    width: '10%',
                                    render: (record) => (
                                        <Flex justify='center' align='center'>
                                            <Text size="sm">
                                                {record.delivery_expected ? new Date(record.delivery_expected).toLocaleDateString() : ''}
                                            </Text>
                                        </Flex>
                                    )
                                },
                                {
                                    accessor: 'actions',
                                    title: <Box mr={6}>Editar</Box>,
                                    titleClassName: classes.actions,
                                    cellsClassName: classes.actions,
                                    textAlign: 'right',
                                    width: '0%',
                                    render: (record) => (
                                        <Group gap={4} justify="right" wrap="nowrap">
                                            <EditProductOrder dataprod={record} upDataProduct={UpdataProduct} />
                                        </Group>
                                    )
                                }
                            ]}
                            rowExpansion={{
                                content: ({ record }) => (
                                    <Stack className={classes.details} p="md" gap={10}>
                                        {record.obs.length > 0 ?
                                            <Flex gap='md'>
                                                <Text size='xs' fw={700}>Observação: </Text>
                                                <Text size='xs'>{record.obs}</Text>
                                            </Flex> : <></>}
                                        {record.reference.length > 0 ?
                                            <Flex gap='md' align='center'>
                                                <Text size='xs' fw={700}>Referência: </Text>
                                                <Anchor
                                                    fz='sm'
                                                    c='black'
                                                    underline="always"
                                                    href={record.reference}
                                                    target='_blank'
                                                >Link para Referência
                                                </Anchor>
                                            </Flex> : <></>}
                                    </Stack>
                                )
                            }}
                            records={dataTable}
                            striped
                            highlightOnHover
                            withTableBorder
                            //pinLastColumn
                            withColumnBorders
                            borderRadius="sm"
                            idAccessor="products.product_id"
                        />
                    </Grid.Col>
                </Grid>
                <Grid type="container" mt={50}>
                    <Grid.Col span={{ base: 12, xs: 12 }}>
                        <Button variant="filled" color="teal.7"
                            onClick={async () => {
                                await updateDataOrder()
                                notifications.show({
                                    title: "Atualizar Requisição",
                                    message: "Requisição atualizada com sucesso!",
                                    position: 'top-center',
                                    color: 'teal.7',
                                })

                            }
                            }
                        >Atualizar Requisição</Button>
                    </Grid.Col>
                </Grid>
            </Card>
        </Stack >
    )
}