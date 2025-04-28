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
  ActionIcon
} from '@mantine/core';
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react"
import  { addProductoOnTable, editDraftProduct, getMeasures, getProducts } from '@/lib/orders/getOrderData';

import classes from "./EditProduct.module.css"
import { IconEdit } from '@tabler/icons-react';
import Loading from '@/app/loading';

export default function EditProduct({ dataprod, upDataDP }) {
  const stack = useModalsStack(['editproduct', 'typenewproduct']);
  const [showdata, setShowData] = useState(false)
  const [optionsProduct, setOptionsProduct] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(dataprod.products.description);

  const [optionsMeasure, setOptionsMeasure] = useState([])
  const [selectedMeasure, setSelectedMeasure] = useState(dataprod.measures.measure)


  const [newproduct, setNewProduct] = useState('')
  const [quantity, setQuantity] = useState(dataprod.quantity)
  const [obs, setObs] = useState(dataprod.obs)
  const [reference, setReference] = useState(dataprod.reference)
  const [productId, setProductId] = useState(dataprod.products.product_id)
  const [measureId, setMeasureId] = useState(dataprod.measures.measure_id)


  const shouldFilterProductOptions = !optionsProduct.some(({ description }) => description === selectedProduct)
  const filteredProductOptions = shouldFilterProductOptions ? optionsProduct.filter(({ description }) => description.toLowerCase().includes(selectedProduct.toLowerCase().trim()))
    : optionsProduct;

  const optionsProductCombo = filteredProductOptions
    .map(({ description, product_id }) => (
      <Combobox.Option value={description} key={product_id}>
        {description}
      </Combobox.Option>
    ))

  const optionsMeasureCombo = optionsMeasure
    .map(({ measure, measure_id }) => (
      <Combobox.Option value={measure} key={measure_id}>
        {measure}
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

  const editProductDraftList = async () => {
    const dataproduct = {
      draft_product_list_id: dataprod.draft_product_list_id,
      product_id: productId,
      measure_id: measureId,
      quantity: parseInt(quantity),
      reference: reference,
      obs: obs
    }
    const epdl = await editDraftProduct(dataproduct)
    upDataDP(dataprod.draft_id)
  }

  const resetFields = () => {
    setSelectedProduct("")
    setNewProduct("")
    setObs("")
    setQuantity("")
    setReference("")
    setSelectedMeasure("")
  }

  useEffect(() => {
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
    getProductOptions()
    getMeasureOptions()
    comboboxproduct.selectFirstOption()
    comboboxmeasure.selectFirstOption()
    setShowData(true)
  }, []);

  const comboboxproduct = useCombobox({
    onDropdownClose: () => {
      comboboxproduct.resetSelectedOption()
    }
  });
  const comboboxmeasure = useCombobox({
    onDropdownClose: () => {
      comboboxmeasure.resetSelectedOption()
    }
  });

  if (!showdata) return <Loading />

  return (
    <>
      <Modal.Stack>
        <Modal {...stack.register('editproduct')} title="Editar Produto" size="lg" className={classes.title}>
          <Combobox
            store={comboboxproduct}
            position="bottom-start"
            withArrow
            onOptionSubmit={(val) => {
              setSelectedProduct(val);
              pid(val)
              comboboxproduct.closeDropdown();
            }}
          >
            <Combobox.Target>
              <TextInput
                label="Produto"
                value={selectedProduct}
                onChange={(event) => {
                  setSelectedProduct(event.currentTarget.value);
                  comboboxproduct.openDropdown();
                }}
                onClick={() => comboboxproduct.openDropdown()}
                onFocus={() => comboboxproduct.openDropdown()}
                onBlur={() => comboboxproduct.closeDropdown()}
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
                label="Quantidade"
                placeholder='Digite a Quantidade'
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.currentTarget.value);
                }} />
            </Grid.Col>
            <Grid.Col span={6} mt='md'>
              <Combobox
                position="bottom-start"
                withArrow
                store={comboboxmeasure}
                onOptionSubmit={(val) => {
                  setSelectedMeasure(val)
                  mid(val)
                  comboboxmeasure.closeDropdown()

                }}>
                <Combobox.Target>
                  <InputBase
                    label="Medida"
                    component='button'
                    type='button'
                    pointer
                    value={selectedMeasure}
                    onClick={() => {

                      comboboxmeasure.toggleDropdown()
                    }}>
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
          </Grid>
          <Group mt="xl" justify="flex-end">
            <Button onClick={() => stack.open('typenewproduct')} color="teal.9">
              Criar Novo Produto
            </Button>
            <Button onClick={() => {
              if (selectedProduct === "" || quantity === '' || selectedMeasure === '') {
                notifications.show({
                  title: "Adicionar Produto",
                  message: "Preencha todos os campos obrigatórios para continuar",
                  position: 'top-center',
                  color: 'red',
                })
                throw new Error
              }
              if (reference && reference.slice(0, 4) !== 'http') {
                notifications.show({
                  title: "ERRO EM REFERÊNCIA",
                  message: "Favor colocar um link válido para a Referência",
                  position: 'top-center',
                  color: 'red',
                })
                throw new Error
              }
              editProductDraftList()
              stack.close('editproduct')
            }}
              color="blue.9">
              Salvar Edição
            </Button>
          </Group>

        </Modal>

        <Modal {...stack.register('typenewproduct')} title="Adicionar Novo Produto" size="lg" className={classes.title}>
          <TextInput
            label="Digite a descrição do novo produto"
            placeholder="Digite a descrição do novo produto"
            value={newproduct}
            onChange={(event) => {
              setNewProduct(event.currentTarget.value.toUpperCase());

            }}
          />
          <Group mt="xl" justify="flex-end">
            <Button onClick={() => {
              stack.close('typenewproduct')
            }} color="red.9">
              Cancelar
            </Button>
            <Button onClick={addProductTb} color="teal.9">
              Adicionar Novo Produto
            </Button>
          </Group>
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