"use client"
import {
  Button,
  TextInput,
  Combobox,
  useCombobox,
  Modal,
  Group,
  useModalsStack,
  Grid,
  InputBase,
  Input,
  ActionIcon,
  NumberInput,
  Stack
} from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react"
import { addProductoOnTable, addSupplier, getMeasures, getProducts, getSupplierByName, getSuppliers, updateOrderProductListByAdmin } from '@/lib/orders/getOrderData';

import classes from "./EditProductOrder.module.css"
import { IconEdit } from '@tabler/icons-react';
import Loading from '@/app/loading';
import { DatePickerInput } from '@mantine/dates';

export default function EditProductOrder({ dataprod, upDataProduct }) {
  const stack = useModalsStack(['editproduct', 'addsupplier']);
  const matches = useMediaQuery('(min-width: 36em)');

  const [showdata, setShowData] = useState(false)

  const [optionsProduct, setOptionsProduct] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(dataprod.products.description);

  const [optionsMeasure, setOptionsMeasure] = useState([])
  const [selectedMeasure, setSelectedMeasure] = useState(dataprod.measures.measure)

  const [optionsSupplier, setOptionsSupplier] = useState([])
  const [supplier, setSupplier] = useState("")
  const [newsupplier, setNewSupplier] = useState('')
  const [cnpj, setCNPJ] = useState('')

  const [purchaseNumber, setPurchaseNumber] = useState(dataprod.purchase_number)
  const [amount, setAmount] = useState(dataprod.amount)

  const [newproduct, setNewProduct] = useState('')
  const [quantity, setQuantity] = useState(dataprod.quantity)
  const [obs, setObs] = useState(dataprod.obs)
  const [reference, setReference] = useState(dataprod.reference)
  const [productId, setProductId] = useState(dataprod.products.product_id)
  const [measureId, setMeasureId] = useState(dataprod.measures.measure_id)
  const [deliveryDateExpected, setDeliveryDateExpected] = useState<Date | null>(dataprod.delivery_expected)


  const shouldFilterProductOptions = !optionsProduct.some(({ description }) => description === selectedProduct)
  const filteredProductOptions = shouldFilterProductOptions ? optionsProduct.filter(({ description }) => description.toLowerCase().includes(selectedProduct.toLowerCase().trim()))
    : optionsProduct;


  /////////////////////////////////////////////////////////
  const comboboxproduct = useCombobox({
    onDropdownClose: () => {
      comboboxproduct.resetSelectedOption()
    }
  });

  const optionsProductCombo = filteredProductOptions
    .map(({ description, product_id }) => (
      <Combobox.Option value={description} key={product_id}>
        {description}
      </Combobox.Option>
    ))

  ////////////////////////////////////////////////////////
  const comboboxmeasure = useCombobox({
    onDropdownClose: () => {
      comboboxmeasure.resetSelectedOption()
    }
  });

  const optionsMeasureCombo = optionsMeasure
    .map(({ measure, measure_id }) => (
      <Combobox.Option value={measure} key={measure_id}>
        {measure}
      </Combobox.Option>
    ))

  ////////////////////////////////////////////////////////
  const comboboxsupplier = useCombobox({
    onDropdownClose: () => {
      comboboxsupplier.resetSelectedOption()
    }
  });

  const optionsSupplierCombo = optionsSupplier
    .map(({ supplier, supplier_id }) => (
      <Combobox.Option value={supplier} key={supplier_id}>
        {supplier}
      </Combobox.Option>
    ))




  const addProductTb = async () => {
    const executeAddProduct = await addProductoOnTable({
      description: newproduct.toUpperCase()
    })
    const products = await getProducts()
    setOptionsProduct(products)
    setSelectedProduct(newproduct)
    setProductId(executeAddProduct?.product_id)
    stack.close('typenewproduct')
  }

  const pid = (prod) => {
    optionsProduct.map(({ description, product_id }) => {
      if (description === prod) {
        setProductId(product_id)
      }
    })
  }

  const mid = (mea) => {
    optionsMeasure.map(({ measure, measure_id }) => {
      if (measure === mea) {
        setMeasureId(measure_id)
      }
    })
  }

  const editProductInOrder = async () => {
    const supp = await getSupplierByName(supplier)
    const dataproduct = {
      order_product_list_id: dataprod.order_product_list_id,
      reference: reference,
      obs: obs,
      supplier_id: supp?.supplier_id,
      purchase_number: purchaseNumber,
      amount: amount,
      delivery_expected: deliveryDateExpected
    }
    const res = await updateOrderProductListByAdmin(dataproduct)
    upDataProduct()

  }

  const resetFields = () => {
    setSelectedProduct("")
    setNewProduct("")
    setObs("")
    setQuantity("")
    setReference("")
    setSelectedMeasure("")
  }

  const saveSupplier = async () => {
    const data = {
      supplier: newsupplier,
      cnpj: cnpj.replace(/\.|\/|-/g, "")
    }
    const ss = await addSupplier(data)
    const supp = await getSuppliers().then((res) => {
      setSupplier(newsupplier)
      setOptionsSupplier(res)
    })
  }

  useEffect(() => {
    if (dataprod?.suppliers !== null) {
      setSupplier(dataprod?.suppliers.supplier)
    }

    const getProductOptions = async () => {
      try {
        const products = await getProducts()
        setOptionsProduct(products)
      } catch (err) { }
    }
    const getMeasureOptions = async () => {
      try {
        const measures = await getMeasures()
        setOptionsMeasure(measures)
      } catch (err) { }
    }

    const getSupplierOptions = async () => {
      try {
        const supp = await getSuppliers()
        setOptionsSupplier(supp)
      } catch (err) { }
    }

    getProductOptions()
    getMeasureOptions()
    getSupplierOptions()

    comboboxproduct.selectFirstOption()
    comboboxmeasure.selectFirstOption()
    setShowData(true)
  }, []);

  if (!showdata) return <Loading />

  return (
    <>
      <Modal.Stack>
        <Modal {...stack.register('editproduct')} title="Editar Produto" size="xl" className={classes.title}>
          <Combobox
            disabled
            store={comboboxproduct}
            position="bottom-start"
            withArrow
          // onOptionSubmit={(val) => {
          //   setSelectedProduct(val);
          //   pid(val)
          //   comboboxproduct.closeDropdown();
          // }}
          >
            <Combobox.Target>
              <TextInput
                disabled
                label="Produto"
                value={selectedProduct}
              // onChange={(event) => {
              //   setSelectedProduct(event.currentTarget.value);
              //   comboboxproduct.openDropdown();
              // }}
              // onClick={() => comboboxproduct.openDropdown()}
              // onFocus={() => comboboxproduct.openDropdown()}
              // onBlur={() => comboboxproduct.closeDropdown()}
              />
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options>
                {optionsProductCombo.length > 0 ? optionsProductCombo : <Combobox.Empty>Descreva o Produto</Combobox.Empty>}</Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          <Grid>
            <Grid.Col span={6} mt='md'>
              <TextInput
                disabled
                label="Quantidade"
                placeholder='Digite a Quantidade'
                value={quantity}
              // onChange={(event) => {
              //   setQuantity(event.currentTarget.value);
              // }} 
              />
            </Grid.Col>
            <Grid.Col span={6} mt='md'>
              <Combobox
                disabled
                position="bottom-start"
                withArrow
                store={comboboxmeasure}
              // onOptionSubmit={(val) => {
              //   setSelectedMeasure(val)
              //   mid(val)
              //   comboboxmeasure.closeDropdown()
              // }}
              >
                <Combobox.Target>
                  <InputBase
                    disabled
                    label="Medida"
                    component='button'
                    type='button'
                    pointer
                    value={selectedMeasure}
                  // onClick={() => {
                  //   comboboxmeasure.toggleDropdown()
                  // }}
                  >
                    {selectedMeasure || <Input.Placeholder>Selecione a medida</Input.Placeholder>}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Options>{optionsMeasureCombo}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Observações"
                placeholder='Observações'
                value={obs}
                onChange={(event) => {
                  setObs(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Referência"
                placeholder='Referência'
                value={reference}
                onChange={(event) => {
                  setReference(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 9 }}>
              <Combobox
                position="bottom-start"
                withArrow
                store={comboboxsupplier}
                onOptionSubmit={(val) => {
                  setSupplier(val)
                  comboboxsupplier.closeDropdown()
                }}
              >
                <Combobox.Target>
                  <InputBase
                    label="Forncedor"
                    component='button'
                    type='button'
                    pointer
                    value={supplier}
                    onClick={() => {
                      comboboxsupplier.toggleDropdown()
                    }}
                  >
                    {supplier || <Input.Placeholder>Selecione o fornecedor</Input.Placeholder>}
                  </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                  <Combobox.Options>{optionsSupplierCombo}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
            </Grid.Col>
            {matches &&
              <Grid.Col span={3}>
                <Stack align='flex-end' justify='center' mt={27}>
                  <Button
                    size='xs'
                    onClick={() => stack.open('addsupplier')}

                  > Adicionar Fornecedor</Button>
                </Stack>
              </Grid.Col>
            }
            {!matches &&
              <Grid.Col span={12}>
                <Stack align='flex-end' justify='center' >
                  <Button size='xs' onClick={() => stack.open('addsupplier')}> Adicionar Fornecedor</Button>
                </Stack>
              </Grid.Col>
            }
            <Grid.Col span={12}>
              <TextInput
                label="Número do Pedido"
                placeholder='Número do Pedido'
                value={purchaseNumber}
                onChange={(event) => {
                  setPurchaseNumber(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                label="Valor Pago"
                placeholder="Valor Pago"
                decimalScale={2}
                value={amount}
                prefix="R$ "
                hideControls
                decimalSeparator=","
                thousandSeparator="."
                onChange={setAmount}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <DatePickerInput
                className={classes.boxtitle}
                label="Data de Entrega Prevista"
                placeholder="Selecione uma Data"
                value={deliveryDateExpected}
                onChange={setDeliveryDateExpected}
                onMouseEnter={() => { }}
                locale="pt-br"
                firstDayOfWeek={1}
                valueFormat="DD/MM/YYYY"
              />
            </Grid.Col>
          </Grid>
          <Group mt="xl" justify="flex-end">
            <Button onClick={async () => {
              if(reference && reference.slice(0,4) !== 'http') {
                notifications.show({
                  title: "ERRO EM REFERÊNCIA",
                  message: "Favor colocar um link válido para a Referência",
                  position: 'top-center',
                  color: 'red',
                })
                throw new Error
              }
              await editProductInOrder()
              stack.close('editproduct')
            }}
              color="blue.9">
              Atualizar Produto
            </Button>
          </Group>

        </Modal>
      </Modal.Stack>
      <Modal.Stack>
        <Modal {...stack.register('addsupplier')} title="Adicionar Fornecedor" size="md" className={classes.title}>
          <Grid>
            <Grid.Col span={12}>
              <InputBase
                label="Fornecedor"
                placeholder='Fornecedor'
                value={newsupplier}
                onChange={(event) => {
                  setNewSupplier(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={12}>
              <InputBase
                component={IMaskInput}
                mask="00.000.000/0000-00"
                label="CNPJ"
                placeholder='CNPJ'
                value={cnpj}
                onChange={(event) => {
                  setCNPJ(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button
                onClick={() => {
                  saveSupplier()
                  notifications.show({
                    title: "Adicionar Fornecedor",
                    message: "Fornecedor adicionado com sucesso",
                    position: 'top-center',
                    color: 'teal',
                  })
                  setNewSupplier('')
                  setCNPJ('')
                  stack.close('addsupplier')
                }}
              >Salvar</Button>
            </Grid.Col>
          </Grid>
        </Modal>
      </Modal.Stack>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="blue"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          stack.open('editproduct')
        }}
      >
        <IconEdit size={16} />
      </ActionIcon>
    </>
  )


}