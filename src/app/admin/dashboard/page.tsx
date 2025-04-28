'use client';

import {
  Card,
  Container,
  Flex,
  Grid,
  PaperProps,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBasket, IconBasketCheck, IconBasketCog, IconBasketDollar, IconBasketExclamation, IconBasketOff, IconBasketQuestion, IconBasketShare, IconBasketStar, IconChevronRight, IconShoppingBagCheck, IconShoppingBagExclamation } from '@tabler/icons-react';

import {
  PageHeader,
} from '@/components';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import classes from './dashboard.module.css'
import { useEffect, useState } from 'react';
import { getAllOrders } from '@/lib/orders/getOrderData';


const PAPER_PROPS: PaperProps = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
  style: { height: '100%' },
};

function Page() {
  const router = useRouter()
  const { data: session } = useSession();

  if (session?.user?.role === "user") {
    router.push("/user/dashboard")
    location.reload()
  }

  const [ordersTotal, setOrdersTotal] = useState()
  const [ordersToApp, setOrdersToApp] = useState()
  const [ordersQuot, setOrdersQuot] = useState()
  const [ordersApp, setOrdersApp] = useState()
  const [ordersCanc, setOrdersCanc] = useState()
  const [ordersSolic, setOrdersSolic] = useState()
  const [ordersFinanc, setOrdersFinanc] = useState()
  const [ordersUser, setOrdersUser] = useState()
  const [ordersDelivery, setOrdersDelivery] = useState()


  useEffect(() => {
    const orders = async () => {
      let ot = 0
      let ota = 0
      let oq = 0
      let oa = 0
      let oc = 0
      let os = 0
      let of = 0
      let ou = 0
      let od = 0
      const o = await getAllOrders()
      o.map((item) => {
        ot++
        if (item.status === "Em Aprovação") {
          ota++
        }
        if (item.status === "Em Cotação") {
          oq++
        }
        if (item.status === "Requisição Aprovada") {
          oa++
        }
        if (item.status === "Cancelada") {
          oc++
        }
        if (item.status === "Pedido Confirmado") {
          os++
        }
        if (item.status === "Aprov. Financeira") {
          of++
        }
        if (item.status === "Análise Usuário") {
          ou++
        }
        if (item.status === "Pedido Entregue") {
          od++
        }
      })
      setOrdersTotal(ot)
      setOrdersToApp(ota)
      setOrdersQuot(oq)
      setOrdersApp(oa)
      setOrdersCanc(oc)
      setOrdersSolic(os)
      setOrdersFinanc(of)
      setOrdersUser(ou)
      setOrdersDelivery(od)
    }
    orders()
  }, [])

  return (
    <>
      <>
        <title>Sistema de Compras</title>
      </>
      <Container fluid>
        <PageHeader title="Dashboard" withActions={true} />
        <Grid mt={20}>
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Card
              shadow="md"
              padding="xl"
              withBorder
              radius='md'
              className={classes.card1}>
              <Stack
                h='20vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasket size={60} ></IconBasket>
                </Flex>
                <Title order={4}>TOTAL REQUISIÇÕES</Title>
                <Text>{ordersTotal} {ordersTotal === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
        <Grid mt={10}>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="sm"
              padding="xl"
              className={classes.card2}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketQuestion size={40} ></IconBasketQuestion>
                </Flex>
                <Title order={4}>EM APROVAÇÃO</Title>
                <Text>{ordersToApp} {ordersToApp === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card3}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketStar size={40} ></IconBasketStar>
                </Flex>
                <Title order={4}>EM COTAÇÃO</Title>
                <Text>{ordersQuot} {ordersQuot === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card4}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketCheck size={40} ></IconBasketCheck>
                </Flex>
                <Title order={4}>APROVADAS</Title>
                <Text>{ordersApp} {ordersApp === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card5}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketShare size={40} ></IconBasketShare>
                </Flex>
                <Title order={4}>PEDIDOS APROVADOS</Title>
                <Text>{ordersSolic} {ordersSolic === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card6}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketDollar size={40} ></IconBasketDollar>
                </Flex>
                <Title order={4}>APROV. FINANCEIRA</Title>
                <Text>{ordersFinanc} {ordersFinanc === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card7}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketExclamation size={40} ></IconBasketExclamation>
                </Flex>
                <Title order={4}>ANALISE USUÁRIO</Title>
                <Text>{ordersUser} {ordersUser === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card8}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketOff size={40} ></IconBasketOff>
                </Flex>
                <Title order={4}>CANCELADAS</Title>
                <Text>{ordersCanc} {ordersCanc === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 3 }}>
            <Card
              shadow="lg"
              padding="xl"
              className={classes.card9}>
              <Stack
                h='15vh'
                align='stretch'
                justify="center"
                gap="md">
                <Flex justify='center'>
                  <IconBasketOff size={40} ></IconBasketOff>
                </Flex>
                <Title order={4}>PEDIDOS ENTREGUES</Title>
                <Text>{ordersDelivery} {ordersDelivery === 1 ? "Requisição" : "Requisições"}</Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}

export default Page;
