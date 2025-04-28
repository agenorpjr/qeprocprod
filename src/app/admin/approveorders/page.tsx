'use client';

import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import {  getOrdersByApprover, updateOrder } from '@/lib/orders/getOrderData';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { ActionIcon, Box, Button, Card, Divider, Flex, Grid, Group, Modal, Stack, Title, Text, Tooltip, TextInput } from '@mantine/core';

import classes from './orders.module.css'
import { IconAdjustments, IconEdit, IconSearch, IconX } from '@tabler/icons-react';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import Loading from '@/app/loading';
import actionCopyOrder from '@/lib/actionCopyOrder';
import clsx from 'clsx';

export type Order = {
  draft_id: number;
  draft_number: number,
  company_id: number,
  delivery_address: string,
  cost_center_id: number,
  cost_center: string,
  project: string,
  projetct_id: number,
  created_at: string,
  delivery_at: string,
  draft_status: string,
  companies: string,
  status: string,
  draft_products_list: []
}

export default function OrdersApproverPage() {
  const { data: session, status } = useSession()

  if (session?.user?.approver === 0) {
    redirect("/")
  }

  const router = useRouter()

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Order>>({
    columnAccessor: 'order_number',
    direction: 'desc',
  });
  const [modalApprov, { open, close }] = useDisclosure(false)
  const [ordersData, setOrdersData] = useState<Order>([])
  const [records, setRecords] = useState(sortBy(ordersData, 'order_id'));
  const [orderTemp, setOrderTemp] = useState(null)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddressQuery] = useDebouncedValue(deliveryAddress, 200);
  const [userName, setUserName] = useState('')
  const [nameQuery] = useDebouncedValue(userName, 200)
  const [companyName, setCompanyNme] = useState('')
  const [companyQuery] = useDebouncedValue(companyName, 200)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderNumberQuery] = useDebouncedValue(orderNumber, 200)

  useEffect(() => {
    const orders = async () => {
      try {
        const res = await getOrdersByApprover(session?.user?.id)
        setOrdersData(res)
        const data = sortBy(res.filter(({ delivery_address, User, companies, order_number }) => {
          if (
            orderNumberQuery !== '' &&
            !order_number.toLowerCase().includes(orderNumberQuery.trim().toLowerCase())
          ) return false

          if (
            deliveryAddressQuery !== '' &&
            !delivery_address.toLowerCase().includes(deliveryAddressQuery.trim().toLowerCase())
          ) return false

          if (
            nameQuery !== '' &&
            !User.name.toLowerCase().includes(nameQuery.trim().toLowerCase())
          ) return false

          if (
            companyQuery !== '' &&
            !companies.company.toLowerCase().includes(companyQuery.trim().toLowerCase())
          ) return false

          return true
        }), sortStatus.columnAccessor) as Order[];

        setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
      } catch (err) { }
    }
    orders()
  }, [sortStatus, deliveryAddressQuery, nameQuery, companyQuery, orderNumberQuery]);

  const orderCopy = async (data: any) => {
    const oc = await actionCopyOrder(data)
      .then(() => {
        router.push('/user/drafts')
      })
  }

  const approveOrder = async () => {
    const ao = await updateOrder({
      order_id: orderTemp.order_id,
      company_id: orderTemp?.company_id,
      delivery_address: orderTemp?.delivery_address,
      cost_center_id: orderTemp?.cost_center_id,
      project_id: orderTemp?.project_id,
      delivery_at: orderTemp?.delivery_at,
      status: 'Requisição Aprovada',
      approver_id: orderTemp?.approver_id
    })
  }

  if (status === 'loading') return <Loading />

  return (
    <>
      <Flex justify='flex-start'><Title order={2} mb={20} className={classes.title} >Requisições para Aprovar</Title></Flex>
      <DataTable
        withTableBorder
        withColumnBorders
        records={records}
        columns={[
          {
            accessor: 'order_number', width: '3%', sortable: true, title: "Req. nº",
            filter: (
              <TextInput
                label="Requisição"
                description="Mostrar requisição"
                placeholder="Buscar por requisição..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setOrderNumber('')}>
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.currentTarget.value)}
              />
            ),
            filtering: orderNumber !== '',
          },
          {
            accessor: 'User.name', width: '25%', title: "Usuário", sortable: true,
            filter: (
              <TextInput
                label="Usuário"
                description="Mostrar usuários"
                placeholder="Buscar por usuários..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setUserName('')}>
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={userName}
                onChange={(e) => setUserName(e.currentTarget.value)}
              />
            ),
            filtering: userName !== '',
          },
          {
            accessor: 'companies.company', width: '25%', title: "Empresa", sortable: true,
            filter: (
              <TextInput
                label="Empresas"
                description="Mostrar empresas"
                placeholder="Buscar por empresas..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setCompanyNme('')}>
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={companyName}
                onChange={(e) => setCompanyNme(e.currentTarget.value)}
              />
            ),
            filtering: companyName !== '',
          },
          {
            accessor: 'delivery_address', width: '35%', title: "Endereço de Entrega", sortable: true,
            filter: (
              <TextInput
                label="Endereço"
                description="Mostrar por endereço"
                placeholder="Search endereços..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={() => setDeliveryAddress('')}>
                    <IconX size={14} />
                  </ActionIcon>
                }
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.currentTarget.value)}
              />
            ),
            filtering: deliveryAddress !== '',
          },
          { accessor: 'cost_centers.cost_center', width: '10%', title: "Centro de Custo", sortable: true },
          { accessor: 'projects.project', width: '15%', title: "Projeto", sortable: true },
          {
            accessor: 'delivery_at',
            textAlign: 'right',
            sortable: true,
            width: '5%',
            title: (
              <Flex justify="center">
                <Title order={6} textWrap="wrap">Entrega Solicitada</Title>
              </Flex>
            ),
            render: ({ delivery_at }) => dayjs(delivery_at).format("DD/MM/YYYY")
          },
          {
            accessor: 'created_at',
            textAlign: 'right',
            sortable: true,
            width: '5%',
            title: "Requisição",
            render: ({ created_at }) => dayjs(created_at).format("DD/MM/YYYY")
          },
          { accessor: 'requester', width: '10%', title: "Solicitante", sortable: true },
          {
            accessor: 'delivery_expected',
            textAlign: 'right',
            sortable: true,
            width: '10%',
            title: (
              <Flex justify="center">
                <Title order={6} textWrap="wrap">Entrega Prevista</Title>
              </Flex>
            ),
            render: ({ delivery_expected }) => delivery_expected ? dayjs(delivery_expected).format("DD/MM/YYYY") : null
          },
          {
            accessor: 'status',
            title: <Box mr={6}>Status</Box>,
            textAlign: 'center',
            width: '0%',
            sortable: true,
            cellsClassName: ({ status }) =>
              clsx({
                [classes.cellaprov]: status === "Em Aprovação",
                [classes.cellcot]: status === "Em Cotação",
                [classes.cellreq]: status === "Requisição Aprovada",
                [classes.cellcancel]: status === "Cancelada",
                [classes.cellsolic]: status === "Pedido Aprovado",
                [classes.cellfinanc]: status === "Aprov. Financeira",
                [classes.celluser]: status === "Análise Usuário",
              }),
            render: (record) => (
              <Text size='xs'>{record.status}</Text>
            )
          },
          {
            accessor: 'actions',
            title: <Box mr={6}>Aprovar</Box>,
            textAlign: 'center',
            width: '0%',
            render: (record) => (
              <Group gap={4} justify="center" wrap="nowrap">
                {record.status === "Em Aprovação" ?
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setOrderTemp(record)
                      open()
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  : <></>
                }

              </Group>
            )
          }
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        idAccessor="order_id"
        rowExpansion={{
          content: ({ record }) => (
            <Stack className={classes.details} p="xs" gap={6}>
              <Card shadow="sm" padding="md" radius="md" withBorder className={classes.card}>
                <Grid>
                  <Grid.Col span={6}><Text fw={700} size='xs'>PRODUTO</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>QUANTIDADE</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>MEDIDA</Text></Grid.Col>
                  <Grid.Col span={2}>
                    <Flex justify="flex-end">
                      <Tooltip label="Gerar Cópia da Requisição">
                        <ActionIcon variant="filled" aria-label="Settings" onClick={() => orderCopy(record)}>
                          <IconAdjustments style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                      </Tooltip>
                    </Flex>
                  </Grid.Col>
                </Grid>
                <Divider my="md" />
                {record.order_products_list.map((item) => {
                  return (
                    <>
                      <Grid maw="80vw">
                        <Grid.Col span={6}><Text size='xs'>{item.products.description}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='xs'>{item.quantity}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='xs'>{item.measures.measure}</Text></Grid.Col>
                        {item.obs.length > 0 ? <Grid.Col span={12}>
                          <Flex gap='md'>
                            <Text size='xs' fw={700}>Observação: </Text>
                            <Text size='xs'>{item.obs}</Text>
                          </Flex>
                        </Grid.Col> : <></>}
                        {item.reference.length > 0 ? <Grid.Col span={12}>
                          <Flex gap='md'>
                            <Text size='xs' fw={700}>Referência: </Text>
                            <Text size='xs'>{item.reference}</Text>
                          </Flex>
                        </Grid.Col> : <></>}

                      </Grid>
                      <Divider my="sm" />
                    </>
                  )
                })}
              </Card>
            </Stack>
          )
        }}

      />
      <Modal
        opened={modalApprov}
        onClose={close}
        title="ATENÇÃO! Confira os dados para aprovar a requisição"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Grid mt={20}>
          <Grid.Col span={4} >
            <Button size="md" color='red' fullWidth onClick={() => {
              setOrderTemp(null)
              close()
            }}>Cancelar</Button>

          </Grid.Col>
          <Grid.Col span={4}>
            <Button fullWidth size="md" color='indigo'
              onClick={() => {
                approveOrder(orderTemp)
                setOrderTemp(null)
                close()
              }}
            >Aprovar</Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
}