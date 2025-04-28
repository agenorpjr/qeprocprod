"use client"

import { useState, useEffect } from 'react';
import cx from 'clsx';
import { Button, ScrollArea, Table } from '@mantine/core';
import classes from './OrderDraftTable.module.css';

import { getDraftId, getDraftsProducts } from '@/lib/orders/getOrderData';

export function OrderDraftTable(props: any) {
  const [scrolled, setScrolled] = useState(false);
  const [dataTable, setdataTable] = useState([])
 
   useEffect(() => {
      const getData = async () => {
          try {
              const dn = await getDraftId(props.draftNumber)
              const dt = await getDraftsProducts(dn)
              setdataTable(dt)
          } catch (err) { }
      }
      getData()
  }, []);

  const rows = dataTable.map((row) => (
    <Table.Tr key={row.draft_product_list_id}>
      <Table.Td>{row.products.description}</Table.Td>
      <Table.Td>{row.measures.measure}</Table.Td>
      <Table.Td>{row.quantity}</Table.Td>
      <Table.Td>{row.obs}</Table.Td>
      <Table.Td>{row.reference}</Table.Td>
    </Table.Tr>
  ));

  return (

    <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      {/* <Button onClick={DraftTableData} >Enviar dados</Button> */}
      <Table miw={700}>
        <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <Table.Tr>
            <Table.Th>Produto</Table.Th>
            <Table.Th>Medida</Table.Th>
            <Table.Th>Quantidade</Table.Th>
            <Table.Th>Observações</Table.Th>
            <Table.Th>Referencia</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
}