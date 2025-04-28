'use client';

import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import { getOrders, updateStatus } from '@/lib/orders/getOrderData';
import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Stack,
  Title,
  Text,
  Tooltip,
  Anchor
} from '@mantine/core';

import classes from './orders.module.css'
import { IconAdjustments } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
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
const PAGE_SIZE = 10;
export default function OrdersPage() {
  const { data: session, status } = useSession()
  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard")
  }

  const router = useRouter()
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Order>>({
    columnAccessor: 'order_number',
    direction: 'asc',
  });
  const [modalDelete, { open, close }] = useDisclosure(false)
  const [ordersData, setOrdersData] = useState<Order>([])
  const [records, setRecords] = useState(sortBy(ordersData, 'order_id'));
  const [draftTemp, setOrderTemp] = useState(null)

  useEffect(() => {

    orders()
  }, [sortStatus, session?.user?.id, page]);

  const orders = async () => {
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const res = await getOrders(session?.user?.id)
      setOrdersData(res)
      const data = sortBy(res, sortStatus.columnAccessor) as Order[];
      setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    } catch (err) { }
  }

  const orderCopy = async (data: any) => {
    const oc = await actionCopyOrder(data)
      .then(() => {
        router.push('/user/drafts')
      })
  }

  const confirmDelivery = async (record: any) => {
    const data = {
      order_id: record.order_id,
      status: 'Pedido Entregue'
    }
    const cd = await updateStatus(data)
    orders()
  }

  if (status === 'loading') return <Loading />

  return (
    <>
      <Flex justify='flex-start'><Title order={2} mb={20} className={classes.title} >Requisições</Title></Flex>
      <DataTable
        withTableBorder
        withColumnBorders
        records={records}
        columns={[
          { accessor: 'order_number', width: '5%', sortable: true, title: "Requisição nº" },
          { accessor: 'companies.company', width: '25%', title: "Empresa", sortable: true },
          { accessor: 'delivery_address', width: '35%', title: "Endereço de Entrega" },
          { accessor: 'cost_centers.cost_center', width: '15%', title: "Centro de Custo", sortable: true },
          { accessor: 'projects.project', width: '15%', title: "Projeto", sortable: true },
          { accessor: 'requester', width: '10%', title: "Solicitante", sortable: true },
          {
            accessor: 'delivery_at',
            textAlign: 'right',
            sortable: true,
            width: '10%',
            title: "Entrega Solicitada",
            render: ({ delivery_at }) => delivery_at ? dayjs(delivery_at).format("DD/MM/YYYY") : null
          },
          {
            accessor: 'created_at',
            textAlign: 'right',
            sortable: true,
            width: '10%',
            title: "Requisição",
            render: ({ created_at }) => dayjs(created_at).format("DD/MM/YYYY")
          },
          {
            accessor: 'actions',
            title: <Box mr={6}>Status</Box>,
            textAlign: 'center',
            width: '0%',
            sortable: true,
            cellsClassName: ({ status }) =>
              clsx({
                [classes.cellaprov]: status === "Em Aprovação",
                [classes.cellcot]: status === "Em Cotação",
                [classes.cellreqaprov]: status === "Requisição Aprovada",
                [classes.cellcancel]: status === "Cancelada",
                [classes.cellpedconf]: status === "Pedido Confirmado",
                [classes.cellfinanc]: status === "Aprov. Financeira",
                [classes.celluser]: status === "Análise Usuário",
                [classes.cellentregue]: status === "Pedido Entregue",
              }),
            render: (record) => (
              <Text size='xs'>{record.status}</Text>
            )
          }
        ]}
        totalRecords={ordersData.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        idAccessor="order_id"
        rowExpansion={{
          content: ({ record }) => (
            <Stack className={classes.details} p="xs" gap={6}>
              <Card shadow="sm" padding="md" radius="md" withBorder className={classes.card}>
                <Grid>
                  <Grid.Col span={3}><Text fw={700} size='xs'>PRODUTO</Text></Grid.Col>
                  <Grid.Col span={1}><Text fw={700} size='xs'>QUANTIDADE</Text></Grid.Col>
                  <Grid.Col span={1}><Text fw={700} size='xs'>MEDIDA</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>FORNECEDOR</Text></Grid.Col>
                  <Grid.Col span={1}><Text fw={700} size='xs'>Nº PEDIDO</Text></Grid.Col>
                  <Grid.Col span={1}><Text fw={700} size='xs'>VALOR</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>ENTREGA PREVISTA</Text></Grid.Col>
                  <Grid.Col span={1}>
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
                      <Grid>
                        <Grid.Col span={3}><Text size='xs' fw={500}>{item.products.description}</Text></Grid.Col>
                        <Grid.Col span={1}><Text size='xs' fw={500}>{item.quantity}</Text></Grid.Col>
                        <Grid.Col span={1}><Text size='xs' fw={500}>{item.measures.measure}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='xs' fw={500}>{item?.suppliers?.supplier ? item.suppliers.supplier : ''}</Text></Grid.Col>
                        <Grid.Col span={1}><Text size='xs' fw={500}>{item?.purchase_number ? item.purchase_number : ''}</Text></Grid.Col>
                        <Grid.Col span={1}><Text size='xs' fw={500}>{item?.amount ? `R$ ${item.amount.toString().replace('.', ',')}` : ''}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='xs' fw={500}>{item.delivery_expected ? dayjs(item.delivery_expected).format("DD/MM/YYYY") : ''}</Text></Grid.Col>
                        {item.obs.length > 0 ? <Grid.Col span={12}>
                          <Flex gap='md' ml={20} align='center'>
                            <Text size='xs' fw={700}>Observação: </Text>
                            <Text size='xs'>{item.obs}</Text>
                          </Flex>
                        </Grid.Col> : <></>}
                        {item.reference.length > 0 ? <Grid.Col span={12}>
                          <Flex gap='md' align='center' ml={20}>
                            <Text size='xs' fw={700}>Referência: </Text>
                            <Anchor
                              fz='xs'
                              c='black'
                              underline="always"
                              href={item.reference}
                              target='_blank'
                            >Link para Referência
                            </Anchor>
                          </Flex>
                        </Grid.Col> : <></>}
                      </Grid>
                      <Divider my="sm" />
                    </>
                  )
                })}
                {record.status === 'Pedido Confirmado' ?
                  <Grid>
                    <Grid.Col span={12}>
                      <Flex justify="flex-end">
                        <Button
                          size='xs'
                          variant='filled'
                          c='white'
                          color='teal'
                          onClick={() => confirmDelivery(record)}
                        >
                          Confirmar Entrega do Pedido
                        </Button>
                      </Flex>
                    </Grid.Col>
                  </Grid> : <></>}
              </Card>
            </Stack>
          )
        }}
      />
    </>
  );
}