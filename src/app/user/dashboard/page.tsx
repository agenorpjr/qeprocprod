'use client';

import {
  Card,
  Container,
  Flex,
  Grid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { PageHeader } from '@/components';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import classes from './dashboard.module.css';
import { useEffect, useState } from 'react';
import { getDrafts, getOrders, getOrdersByApprover } from '@/lib/orders/getOrderData';
import { IconBasketCog, IconBasketStar, IconShoppingBagCheck, IconShoppingBagExclamation } from '@tabler/icons-react';


function Page() {
  const router = useRouter()
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    router.push("/admin/dashboard")
    location.reload()
  }

  const [ordersApprove, setOrdersApprove] = useState()
  const [ordersRequest, setOrdersRequest] = useState()
  const [drafts, setDrafts] = useState()
  const [ordersToApprove, setOrdersToApprove] = useState()
  const [approverYes, setApproverYes] = useState(false)

  useEffect(() => {
      getDraftsData()
      getOrderData()
      if (session?.user?.role === "approver") {
        setApproverYes(true)
        getOrdersToApproveData()
      }
  }, [ordersApprove, ordersRequest, drafts, ordersToApprove])


  const getOrderData = async () => {
    const goa = await getOrders(session?.user?.id)
    .then((res) => {
      let totalapp = 0
      let totalreq = res.length
      res.map((item) => {
       if (item.status === "Em Aprovação") totalapp++
      })
      setOrdersApprove(totalapp)
      setOrdersRequest(totalreq)
    })
  }

  const getDraftsData = async () => {
    const gdd = await getDrafts(session?.user?.id)
    .then((res) => {
      setDrafts(res?.length)
    })
  }

  const getOrdersToApproveData = async () => {
    const ota = await getOrdersByApprover(session?.user?.id)
    let totalota = 0
    ota.map((item) => {
      if (item.status === "Em Aprovação") {
        totalota++
      }
    })
    setOrdersToApprove(totalota)
  }


  return (
    <>
      <>
        <title>Sistema de Compras</title>
      </>
      <Container fluid>

        <PageHeader title="Dashboard" withActions={true} />
        <Grid mt={20}>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="md"
              padding="xl"
              withBorder
              radius='md'
              className={classes.card1}>
              <Stack
                h='30vh'
                align='stretch'
                justify="center"
                gap="md">
                  <Flex justify='center'>
                  <IconShoppingBagExclamation size={100} ></IconShoppingBagExclamation>
                  </Flex>
                
                <Title order={4}>REQUISIÇÕES AGUARDANDO APROVAÇÃO</Title>
                <Text>{ordersApprove} Requisições</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="sm"
              padding="xl"
              className={classes.card2}>
              <Stack
                h='30vh'
                align='stretch'
                justify="center"
                gap="md">
                  <Flex justify='center'>
                  <IconShoppingBagCheck size={100} ></IconShoppingBagCheck>
                  </Flex>
                <Title order={4}>REQUISIÇÕES EFETUADAS</Title>
                <Text>{ordersRequest} Requisições</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card3}>
              <Stack
                h='30vh'
                align='stretch'
                justify="center"
                gap="md">
                  <Flex justify='center'>
                  <IconBasketCog size={100} ></IconBasketCog>
                  </Flex>
                <Title order={4}>SOLICITAÇÕES</Title>
                <Text>{drafts} Solicitações</Text>
              </Stack>
            </Card>
          </Grid.Col>
          {approverYes ?
        <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card4}>
              <Stack
                h='30vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketStar size={100} ></IconBasketStar>
                </Flex>
                <Title order={4}>REQUISIÇÕES PARA APROVAR</Title>
                <Text>{ordersToApprove} {ordersToApprove === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col> : <></>
        }
        </Grid>
      </Container>
    </>
  );
}

export default Page;
