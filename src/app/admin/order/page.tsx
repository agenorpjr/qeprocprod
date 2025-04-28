'use client'
import {
    Card,
    Text,
    Grid,
    Button,
    Divider,
    ActionIcon,
    Group,
    Flex,
    Stack,
    Box,
    useCombobox,
    Combobox,
    InputBase,
    Input,
    Anchor,
    TextInput
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates";
import 'dayjs/locale/pt-br';

import ComboCompany from "@/components/ComboCompany/ComboCompany";
import ComboDelivery from "@/components/ComboDelivery/ComboDelivery";
import ComboCostCenter from "@/components/ComboCostCenter/CostCenter";
import ComboProject from "@/components/ComboProject/ComboProject";
import AddProduct from "@/components/AddProduct/page";

import classes from './order.module.css'
import { useSession } from "next-auth/react";

import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { addDraftNumber, getDraftNumber, updateDraft, getDraftId, getDraftsProducts, getProjectId, addProject, deleteDraftProduct, getUsers } from "@/lib/orders/getOrderData";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { DataTable } from "mantine-datatable";
import EditProduct from "@/components/EditProduct/page";
import actionSaveOrder from "@/lib/actionSaveOrder";


export default function NewOrder() {

    const { data: session } = useSession()

    if (!session) {
        redirect("/")
    }

    if (session?.user?.role === "user") {
        redirect("/user/dashboard")
    }
    const router = useRouter()
    const [companyName, setCompanyName] = useState('')
    const [companyId, setCompanyId] = useState(0)
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
    const [deliveryAddress, setDeliveryAddess] = useState('')
    const [costCenter, setCostCenter] = useState('')
    const [costCenterId, setCostCenterId] = useState(0)
    const [projectName, setProjectName] = useState('')
    const [projectId, setProjectId] = useState(0)
    const [requester, setRequester] = useState('')

    const [selectedApprover, setSelectedApprover] = useState('')
    const [approvers, setApprovers] = useState<string[] | null>(null);

    const [enablefields, setEnablefields] = useState(true)
    const [enableSave, setEnableSave] = useState(true)
    const [draftNumber, setDraftNumber] = useState("")
    const [draftId, setDraftId] = useState<number | 0>(0)

    const [dataTable, setdataTable] = useState([])

    const resetFields = () => {
        setCompanyName("")
        setCompanyId(0)
        setDeliveryDate(null)
        setDeliveryAddess("")
        setCostCenter('')
        setCostCenterId(0)
        setProjectName('')
        setProjectId(0)
        setEnablefields(true)
        setDraftNumber("")
        setDraftId(0)
        setdataTable([])
        setRequester('')
        setSelectedApprover('')
    }

    useEffect(() => {
        const approvers = async () => {
            const result = await getUsers()
            let app = []
            result.map((item) => {
                if (item.approver === 1) {
                    app.push(item)
                }
            })
            setApprovers(app)
        }
        approvers()
        resetFields()
    }, [])

    const UpdataDP = async (draftid: number) => {
        setDraftId(draftid)
        const dt = await getDraftsProducts(draftid)
        setdataTable(dt)
    }

    const ComboCompanyData = (ComboCompanyData: any) => {
        setCompanyName(ComboCompanyData.company)
        setCompanyId(ComboCompanyData.company_id)
        setCostCenter("")
        setCostCenterId(0)
        saveTempDraft({ company_id: ComboCompanyData.company_id })
    }

    const ComboDeliveryData = (ComboDeliveryData: any) => {
        setDeliveryAddess(ComboDeliveryData)
        saveTempDraft({ delivery_address: ComboDeliveryData })
    }

    const ComboCostCenterData = (ComboCostCenterData: any) => {
        setCostCenterId(ComboCostCenterData.cost_center_id)
        saveTempDraft({ cost_center_id: ComboCostCenterData.cost_center_id })
    }

    const ComboProjectData = async (ComboProjectData: any) => {
        setProjectName(ComboProjectData)
    }

    const neworderEnable = async () => {
        const latestQuery = await getDraftNumber()
        const ln = parseInt(latestQuery.replace(/([^\d])+/gim, ''));
        const latestQuerynumber = `${latestQuery.replace(/[0-9]/g, '')}${(ln + 1)}`
        setDraftNumber(latestQuerynumber)
        const adn = await addDraftNumber(latestQuerynumber, session.user?.id)
            .then(async () => {
                const dn = await getDraftId(latestQuerynumber)
                    .then((trd) => {
                        setDraftId(trd)
                        setEnablefields(false)
                    })
            })
    }

    const deleteProd = async (proddata: any) => {
        const dp = await deleteDraftProduct(proddata.draft_product_list_id)
    }

    const saveTempDraft = async (tempData: any) => {
        const updateValues = await updateDraft(tempData, draftNumber)
    }

    const saveDraft = async () => {
        if (companyName === '' || deliveryDate === null || deliveryAddress === '' || selectedApprover === '') {
            notifications.show({
                title: "Solicitações",
                message: "Preencha todos os campos para continuar",
                position: 'top-center',
                color: 'red',
            })
            throw new Error
        }

        if (companyName !== 'HOLLYWOOD' && costCenterId === 0) {
            notifications.show({
                title: "Solicitações",
                message: "Preencha com o Centro de Custo Correto!!",
                position: 'top-center',
                color: 'red',
            })
            throw new Error
        }
        if (companyName === 'HOLLYWOOD' && projectName === "") {
            if (costCenterId === 0) {
                notifications.show({
                    title: "Solicitações",
                    message: "Preencha com o Projeto ou o Centro de Custo",
                    position: 'top-center',
                    color: 'red',
                })
                throw new Error
            }
        }

        if (companyName === 'HOLLYWOOD' && projectName !== '') {
            const getProj = await getProjectId(projectName)
                .then(async (res) => {
                    if (!res) {
                        const addproj = await addProject(projectName)
                        const gproj = await getProjectId(projectName)
                        const appId = await checkApprover()
                        const values = {
                            company_id: companyId,
                            delivery_address: deliveryAddress,
                            cost_center_id: 0,
                            delivery_at: deliveryDate,
                            project_id: gproj,
                            approver_id: appId,
                            requester: requester
                        }
                        const updateValues = await updateDraft(values, draftNumber)
                        setProjectId(gproj)
                        setCostCenterId(0)
                    } else {
                        const appId = await checkApprover()
                        const values = {
                            company_id: companyId,
                            delivery_address: deliveryAddress,
                            cost_center_id: 0,
                            delivery_at: deliveryDate,
                            project_id: res,
                            approver_id: appId,
                            requester: requester
                        }
                        const updateValues = await updateDraft(values, draftNumber)
                        setProjectId(res)
                        setCostCenterId(0)
                    }
                })
        } else {
            const appId = await checkApprover()
            const values = {
                company_id: companyId,
                delivery_address: deliveryAddress,
                cost_center_id: costCenterId,
                delivery_at: deliveryDate,
                project_id: 0,
                approver_id: appId,
                requester: requester
            }
            const updateValues = await updateDraft(values, draftNumber)
        }
        setEnableSave(false)
        
    }

    const checkApprover = async () => {
        let result
        const res = approvers?.map((item) => {
            if (item.name === selectedApprover) {
                result = item.id
            }
        })
        return result
    }

    const saveOrder = async () => {
        const sd = await saveDraft()
            .then(async () => {
                if (deliveryDate < new Date(Date.now())) {
                    notifications.show({
                        title: "Data Inválida",
                        message: "Data de Entrega não pode ser inferior ao dia da Requisição",
                        position: 'top-center',
                        color: 'red',
                    })
                    throw new Error
                }
                if (dataTable.length === 0) {
                    notifications.show({
                        title: "Sem Produtos",
                        message: "Adicione o produto para a requisição.",
                        position: 'top-center',
                        color: 'red',
                    })
                    throw new Error
                }
                const saveorderdata = {
                    userId: session?.user?.id,
                    draftId: draftId,
                }
                const so = await actionSaveOrder(saveorderdata)
            }).then(() => {
                router.push("/user/orders")
            })
    }

    const approverComboBox = useCombobox({
        onDropdownClose: () => approverComboBox.resetSelectedOption(),
    })

    const approverOptions = approvers?.map((item) => (
        <Combobox.Option value={item.name} key={item.id}>
            {item.approver === 1 ? item.name : null}
        </Combobox.Option>
    ))

    if (enablefields) {
        return (
            <Stack w="100%" h="80vh" justify="center">
                <Flex justify="center" align="center">
                    <Card shadow="sm" padding="lg" radius="md" withBorder miw='50%'>
                        <Group justify="space-between" mt="md" mb="xs">
                            <Text fw={500}>Nova Solicitação</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                            Clique para gerar uma nova solicitação
                        </Text>
                        <Button onClick={neworderEnable} mt={30}>Nova Solicitação</Button>
                    </Card>
                </Flex>
            </Stack>
        )
    } else {
        return (
            <Stack w="100%" justify="center">
                <Card shadow="sm" padding='sm'>
                    <Card.Section p="sm" className={classes.card}>
                        <Group justify="space-between">
                            <Text fw={900} size="md" className={classes.title} >
                                Solicitação de Materiais
                            </Text>
                            <Text fw={900} size="md" className={classes.title}>
                                {new Date(Date.now()).toLocaleString('pt-BR').split(',')[0]}
                            </Text>
                        </Group>
                    </Card.Section>
                    <Group justify="space-between">
                        <Text fw={900} size="lg" mt="md" mb={10} variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 90 }} >
                            Dados da Solicitação - Nº {draftNumber}
                        </Text>
                    </Group>
                    <Divider mb={15} />
                    <Grid>
                        <Grid.Col span={{ base: 12, xs: 4 }}>
                            <ComboCompany ComboCompanyData={ComboCompanyData} companyName={""} />
                        </Grid.Col>
                        {companyName === "HOLLYWOOD" ? <>
                            <Grid.Col span={{ base: 12, xs: 4 }}>
                                <ComboProject ComboProjectData={ComboProjectData} projectName={""} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 4 }}>
                                <ComboCostCenter ComboCostCenterData={ComboCostCenterData} costCenterName={""} companyId={companyId} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 6 }}>
                                <ComboDelivery ComboDeliveryData={ComboDeliveryData} deliveryAddress={""} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 2 }}>
                                <DatePickerInput
                                    required
                                    label="Data de Entrega"
                                    placeholder="Selecione uma Data"
                                    value={deliveryDate}
                                    onChange={setDeliveryDate}
                                    onMouseEnter={() => saveTempDraft({ delivery_at: deliveryDate })}
                                    locale="pt-br"
                                    firstDayOfWeek={1}
                                    valueFormat="DD/MM/YYYY"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 2 }}>
                                <Combobox
                                    store={approverComboBox}
                                    withinPortal={false}
                                    onOptionSubmit={(val) => {
                                        setSelectedApprover(val)
                                        approverComboBox.closeDropdown()
                                    }}
                                >
                                    <Combobox.Target>
                                        <InputBase
                                            label="Aprovador"
                                            required
                                            component="button"
                                            type="button"
                                            pointer
                                            rightSection={<Combobox.Chevron />}
                                            onClick={() => {
                                                approverComboBox.toggleDropdown()
                                            }}
                                            rightSectionPointerEvents="none">
                                            {selectedApprover || <Input.Placeholder>Selecione um Aprovador</Input.Placeholder>}
                                        </InputBase>
                                    </Combobox.Target>
                                    <Combobox.Dropdown>
                                        <Combobox.Options>{approverOptions}</Combobox.Options>
                                    </Combobox.Dropdown>
                                </Combobox>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 2 }}>
                                <TextInput
                                    label="Solicitante"
                                    placeholder="Digite o Solicitante"
                                    value={requester}
                                    onChange={(event) => setRequester(event.currentTarget.value)}
                                />
                            </Grid.Col>

                        </> :
                            <>
                                <Grid.Col span={{ base: 12, xs: 4 }}>
                                    <ComboCostCenter ComboCostCenterData={ComboCostCenterData} costCenterName={""} companyId={companyId} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, xs: 4 }}>
                                    <DatePickerInput
                                        required
                                        label="Data de Entrega"
                                        placeholder="Selecione uma Data"
                                        value={deliveryDate}
                                        onChange={setDeliveryDate}
                                        onMouseEnter={() => saveTempDraft({ delivery_at: deliveryDate })}
                                        locale="pt-br"
                                        firstDayOfWeek={1}
                                        valueFormat="DD/MM/YYYY"
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, xs: 6 }}>
                                    <ComboDelivery ComboDeliveryData={ComboDeliveryData} deliveryAddress={""} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, xs: 3 }}>
                                    <Combobox
                                        store={approverComboBox}
                                        withinPortal={false}
                                        onOptionSubmit={(val) => {
                                            setSelectedApprover(val)
                                            approverComboBox.closeDropdown()
                                        }}
                                    >
                                        <Combobox.Target>
                                            <InputBase
                                                label="Aprovador"
                                                required
                                                component="button"
                                                type="button"
                                                pointer
                                                rightSection={<Combobox.Chevron />}
                                                onClick={() => {
                                                    approverComboBox.toggleDropdown()
                                                }}
                                                rightSectionPointerEvents="none">
                                                {selectedApprover || <Input.Placeholder>Selecione um Aprovador</Input.Placeholder>}
                                            </InputBase>
                                        </Combobox.Target>
                                        <Combobox.Dropdown>
                                            <Combobox.Options>{approverOptions}</Combobox.Options>
                                        </Combobox.Dropdown>
                                    </Combobox>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, xs: 3 }}>
                                    <TextInput
                                        label="Solicitante"
                                        placeholder="Digite o Solicitante"
                                        value={requester}
                                        onChange={(event) => setRequester(event.currentTarget.value)}
                                    />
                                </Grid.Col>
                            </>
                        }

                    </Grid>
                    <Divider mb={5} mt={30} />
                    <Grid>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <Flex gap='md' mt={10}>
                                <Text className={classes.subtitle} mt={1}>
                                    Lista de Materiais
                                </Text>

                                <AddProduct draftNumber={draftNumber} upDataDP={UpdataDP} />
                            </Flex>
                        </Grid.Col>
                        <Grid.Col span={12} maw='90vw'>
                            <DataTable
                                columns={[
                                    {
                                        accessor: 'products.description',
                                        title: 'Produtos',
                                        width: "30%",
                                        noWrap: true,
                                    },
                                    {
                                        accessor: 'measures.measure',
                                        title: "Medida",
                                        width: "10%"
                                    },
                                    {
                                        accessor: 'quantity',
                                        title: 'Quantidade',
                                        width: "10%"
                                    },
                                    {
                                        accessor: 'actions',
                                        title: <Box mr={6}>Ações</Box>,
                                        textAlign: 'right',
                                        width: '0%',
                                        render: (record) => (
                                            <Group gap={4} justify="right" wrap="nowrap">
                                                <EditProduct dataprod={record} upDataDP={UpdataDP} />
                                                <ActionIcon
                                                    size="sm"
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        deleteProd(record)
                                                        UpdataDP(record.draft_id)
                                                    }}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        )
                                    }
                                ]}
                                rowExpansion={{
                                    content: ({ record }) => (
                                        <Stack className={classes.details} p="xs" gap={6}>
                                            {record.obs.length > 0 ?
                                                <Flex gap='md' align='center' ml={20}>
                                                    <Text size='xs' fw={700}>Observação: </Text>
                                                    <Text size='xs'>{record.obs}</Text>
                                                </Flex> : <></>}
                                            {record.reference.length > 0 ?
                                                <Flex gap='md' align='center' ml={20}>
                                                    <Text size='xs' fw={700}>Referência: </Text>
                                                    <Anchor
                                                        fz='xs'
                                                        c='black'
                                                        underline="always"
                                                        variant="subtle"
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
                                pinLastColumn
                                idAccessor="products.product_id"
                            />
                        </Grid.Col>
                    </Grid>
                    <Grid type="container" mt={50}>
                        <Grid.Col span={{ base: 12, xs: 12 }}>
                            <Button variant="filled" color="teal.7"
                                onClick={async () => {
                                    const sd = await saveDraft()
                                        .then(() => {
                                            notifications.show({
                                                title: "Solicitação",
                                                message: "Solicitação salva com Sucesso!!!",
                                                position: 'top-center',
                                                color: 'indigo',
                                            })
                                        })
                                }
                                }
                            >Salvar Solicitação</Button>
                            {enableSave ? <></> :
                                <Button ml={20} variant="filled" color="indigo"
                                    onClick={async () => {
                                        const so = await saveOrder()
                                            .then(() => {
                                                notifications.show({
                                                    title: "Requisição",
                                                    message: "Requisição efetuada com Sucesso!!!",
                                                    position: 'top-center',
                                                    color: 'indigo',
                                                })
                                            })

                                    }
                                    }
                                >Enviar Requisição</Button>}
                        </Grid.Col>
                    </Grid>
                </Card>
            </Stack >
        )
    }
}