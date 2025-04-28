'use client';

import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import { deleteDraftById, deleteDraftProduct, getDrafts, getDraftsProducts } from '@/lib/orders/getOrderData';

import { redirect, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { ActionIcon, Anchor, Box, Button, Card, Divider, Flex, Grid, Group, Modal, Stack, Text, Title } from '@mantine/core';

import classes from './drafts.module.css'
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Loading from '@/app/loading';

export type Draft = {
  draft_id: number;
  draft_number: number,
  company_id: number,
  delivery_address: string,
  cost_center: string,
  cost_center_id: number,
  project: string,
  project_id: number,
  created_at: string,
  delivery_at: string,
  draft_status: string,
  companies: string,
  draft_products_list: []
}
const PAGE_SIZE = 10;

export default function DraftPage() {
  const { data: session, status } = useSession()

  if (session?.user?.role === "admin") {
    redirect("/admin/dashboard")
  }
  const [page, setPage] = useState(1);
  const router = useRouter()
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Draft>>({
    columnAccessor: 'draft_number',
    direction: 'desc',
  });
  const [modalDelete, { open, close }] = useDisclosure(false)
  const [draftsData, setDraftsData] = useState<Draft>([])
  const [records, setRecords] = useState(sortBy(draftsData, 'draft_id'));
  const [draftTemp, setDraftTemp] = useState(null)


  useEffect(() => {

    const drafts = async () => {
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE;
        const res = await getDrafts(session?.user?.id)
        setDraftsData(res)

        const data = sortBy(res, sortStatus.columnAccessor) as Draft[];
        setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
      } catch (err) { }
    }
    drafts()
  }, [sortStatus, session?.user?.id, page]);

  const deleteDraft = async (datadeletedraft: any) => {
    const gdp = await getDraftsProducts(datadeletedraft)
    const delprods = gdp.map(async (res) => {
      await deleteDraftProduct(res.draft_product_list_id)
    })

    const res = await deleteDraftById(datadeletedraft)
    updateDrafts()
  }

  const updateDrafts = async () => {
    try {
      const res = await getDrafts(session?.user?.id)
      setDraftsData(res)
      const data = sortBy(res, sortStatus.columnAccessor) as Draft[];
      setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    } catch (err) { }
  }

  if (status === 'loading') return <Loading />

  return (
    <>
      <Flex justify='flex-start' align='center' gap="lg">
        <Title order={2} mb={20} className={classes.title}>Solicitações</Title>
        <Title order={3} mb={20} className={classes.title} >{session?.user?.name}</Title>
      </Flex>

      <DataTable
        withTableBorder
        withColumnBorders
        records={records}
        columns={[
          { accessor: 'draft_number', width: '5%', sortable: true, title: "Solicitação nº" },
          { accessor: 'companies.company', width: '25%', title: "Empresa", sortable: true },
          { accessor: 'delivery_address', width: '35%', title: "Endereço de Entrega" },
          { accessor: 'cost_centers.cost_center', width: '15%', title: "Centro de Custo", sortable: true },
          { accessor: 'projects.project', width: '15%', title: "Projeto", sortable: true },
          { accessor: 'requester', width: '10%', title: "Solicitante", sortable: true },
          {
            accessor: 'delivery_at',
            textAlign: 'right',
            sortable: true,
            width: '15%',
            title: "Data de Entrega",
            render: ({ delivery_at }) => dayjs(delivery_at).format("DD/MM/YYYY")
          },
          {
            accessor: 'created_at',
            textAlign: 'right',
            sortable: true,
            width: '15%',
            title: "Data da Solicitação",
            render: ({ created_at }) => dayjs(created_at).format("DD/MM/YYYY")
          },
          {
            accessor: 'actions',
            title: <Box mr={6}>Ações</Box>,
            textAlign: 'right',
            width: '0%',
            render: (record) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    router.push(`/user/editdraft?dId=${record.draft_id}`)
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setDraftTemp(record.draft_id)
                    open()

                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

            )
          }
        ]}
        totalRecords={draftsData.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        idAccessor="draft_id"
        rowExpansion={{
          content: ({ record }) => (
            <Stack className={classes.details} p="xs" gap={6}>
              <Divider my="md" />
              <Card shadow="sm" padding="md" radius="md" withBorder className={classes.card}>
                <Grid>
                  <Grid.Col span={6}><Text fw={700} size='xs'>PRODUTO</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>QUANTIDADE</Text></Grid.Col>
                  <Grid.Col span={2}><Text fw={700} size='xs'>MEDIDA</Text></Grid.Col>
                </Grid>
                <Divider my="md" />
                {record.draft_products_list.map((item) => {
                  return (
                    <>
                      <Grid>
                        <Grid.Col span={6}><Text size='sm' fw={500}>{item.products.description}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='sm' fw={500}>{item.quantity}</Text></Grid.Col>
                        <Grid.Col span={2}><Text size='sm' fw={500}>{item.measures.measure}</Text></Grid.Col>
                        {item.obs.length > 0 ? <Grid.Col span={12}>
                          <Flex gap='md' align='center' ml={20}>
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
              </Card>
            </Stack>
          )
        }}

      />
      <Modal
        opened={modalDelete}
        onClose={close}
        title="ATENÇÃO! Tem certeza que deseja excluir?"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Grid mt={20}>
          <Grid.Col span={4} >
            <Button size="md" fullWidth onClick={() => {
              setDraftTemp(null)
              close()
            }}>Cancelar</Button>

          </Grid.Col>
          <Grid.Col span={4}>
            <Button fullWidth size="md" color='red'
              onClick={() => {
                deleteDraft(draftTemp)
                setDraftTemp(null)
                close()
              }}
            >Excluir</Button>
          </Grid.Col>
        </Grid>
      </Modal>
    </>
  );
}