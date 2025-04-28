'use client'
import {
    Card,
    Text,
    Grid,
    Button,
    Divider,
    ActionIcon,
    Group,
    Box,
    Stack,
    Flex,
    useCombobox,
    Combobox,
    InputBase,
    Input,
    Anchor,
} from "@mantine/core"
import { DatePickerInput } from "@mantine/dates";
import 'dayjs/locale/pt-br';

import { DataTable } from 'mantine-datatable';

import ComboCompany from "@/components/ComboCompany/ComboCompany";
import ComboDelivery from "@/components/ComboDelivery/ComboDelivery";
import ComboCostCenter from "@/components/ComboCostCenter/CostCenter";
import ComboProject from "@/components/ComboProject/ComboProject";
import AddProduct from "@/components/AddProduct/page";

import classes from './editdraft.module.css'
import { useSession } from "next-auth/react";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { 
    updateDraft, 
    getDraftsProducts, 
    getDraftById, 
    getApproverByUserId, 
    getProjectId, 
    addProject, 
    deleteDraftProduct, 
    getUsers 
} from "@/lib/orders/getOrderData";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Loading from "@/app/loading";
import EditProduct from "@/components/EditProduct/page";
import actionSaveOrder from "@/lib/actionSaveOrder";

export default function EditDraftPage() {

    const { data: session } = useSession()
    if (session?.user?.role === "admin") {
        redirect("/admin/dashboard")
    }
    const searchParams = useSearchParams()
    const dId = searchParams.get('dId')
    const router = useRouter()

    const [showData, setShowData] = useState(false)
    const [companyName, setCompanyName] = useState('')
    const [companyId, setCompanyId] = useState('')
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
    const [draftDate, setDraftDate] = useState<Date | null>(null)
    const [deliveryAddress, setDeliveryAddess] = useState('')
    const [costCenter, setCostCenter] = useState('')
    const [costCenterId, setCostCenterId] = useState(0)
    const [projectName, setProjectName] = useState('')
    const [selectedApprover, setSelectedApprover] = useState('')
    const [approvers, setApprovers] = useState<string[] | null>(null);

    const [draftNumber, setDraftNumber] = useState("")
    const [draftId, setDraftId] = useState(0)

    const [dataTable, setdataTable] = useState([])

    const resetFields = () => {
        setCompanyName("")
        setDeliveryDate(null)
        setDraftNumber("")
        setDraftId(0)
        setdataTable([])
    }

    const getData = async () => {

        const res = await getDraftById(parseInt(dId))
        const approver = await getApproverByUserId(res?.approver_id)
        setCompanyName(res.companies?.company)
        setCompanyId(res.company_id)
        setDeliveryAddess(res.delivery_address)
        setDeliveryDate(res.delivery_at)
        setDraftDate(res.created_at)
        setDraftNumber(res.draft_number)
        setDraftId(res.draft_id)
        setdataTable(res.draft_products_list)
        setCostCenterId(res?.cost_centers ? res?.cost_centers.cost_center_id : 0)
        setCostCenter(res?.cost_centers ? res?.cost_centers?.cost_center : '')
        setProjectName(res?.projects?.project ? res?.projects.project : '')
        //setProjectId(res.projects?.project_id ? res.projects?.project_id : 0)
        setSelectedApprover(approver.name)
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
        setShowData(true)
    }

    useEffect(() => {
        getData()
    }, [])

    const UpdataDP = async (draftid: number) => {
        setDraftId(draftid)
        const dt = await getDraftsProducts(draftid)
        setdataTable(dt)
    }

    const deleteProd = async (proddata: any) => {
        const dp = await deleteDraftProduct(proddata.draft_product_list_id)
    }

    const ComboCompanyData = (ComboCompanyData: any) => {
        setCompanyName(ComboCompanyData.company)
        setCompanyId(ComboCompanyData.company_id)
        setCostCenter("")
        setCostCenterId(0)
    }

    const ComboDeliveryData = (ComboDeliveryData: any) => {
        setDeliveryAddess(ComboDeliveryData)
    }

    const ComboCostCenterData = (ComboCostCenterData: any) => {
        if (ComboCostCenterData.const_center === "") {
            setCostCenterId(0)
            setCostCenter('')
        } else {
            setCostCenter(ComboCostCenterData.cost_center)
            setCostCenterId(ComboCostCenterData.cost_center_id)
        }
    }

    const ComboProjectData = (ComboProjectData: any) => {
        setProjectName(ComboProjectData)
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
        if (companyName === 'HOLLYWOOD' && projectName === '') {
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
                            approver_id: appId
                        }
                        const updateValues = await updateDraft(values, draftNumber)
                        setCostCenterId(0)
                    } else {
                        const appId = await checkApprover()
                        const values = {
                            company_id: companyId,
                            delivery_address: deliveryAddress,
                            cost_center_id: 0,
                            delivery_at: deliveryDate,
                            project_id: res,
                            approver_id: appId
                        }
                        const updateValues = await updateDraft(values, draftNumber)
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
                approver_id: appId
            }
            const updateValues = await updateDraft(values, draftNumber)
        }
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
                        message: "Adicione produto para a requisição.",
                        position: 'top-center',
                        color: 'red',
                    })
                    throw new Error
                }

                const saveorderdata = {
                    userId: session?.user?.id,
                    draftId: draftId
                }
                const so = await actionSaveOrder(saveorderdata)
            })
            .then(() => {
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

    if (!showData) return <Loading />

    return (
        <Stack w="100%" justify="center">
            <Card shadow="sm" padding='sm' className={classes.wcard}>
                <Card.Section p="sm" className={classes.card}>
                    <Group justify="space-between">

                        <Text fw={900} size="md" className={classes.title} >
                            Requisição de Materiais
                        </Text>
                        <Text fw={900} size="md" className={classes.title}>
                            {new Date(draftDate).toLocaleDateString()}
                        </Text>
                    </Group>
                </Card.Section>
                <Group justify="space-between">
                    <Text fw={900} size="lg" mt="md" mb={10} variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 90 }}>
                        Dados da Solicitação - Nº {draftNumber}
                    </Text>
                </Group>
                <Divider mb={15} />
                <Grid>
                    <Grid.Col span={{ base: 12, xs: 4 }}>
                        <ComboCompany ComboCompanyData={ComboCompanyData} companyName={companyName} />
                    </Grid.Col>
                    {companyName === "HOLLYWOOD" ? <>
                        <Grid.Col span={{ base: 12, xs: 4 }}>
                            <ComboProject ComboProjectData={ComboProjectData} projectName={projectName} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 4 }}>
                            <ComboCostCenter ComboCostCenterData={ComboCostCenterData} costCenterName={costCenter} companyId={companyId} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <ComboDelivery ComboDeliveryData={ComboDeliveryData} deliveryAddress={deliveryAddress} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 3 }}>
                            <DatePickerInput
                                required
                                label="Data de Entrega"
                                placeholder="Selecione uma Data"
                                value={deliveryDate}
                                onChange={setDeliveryDate}
                                locale="pt-br"
                                firstDayOfWeek={1}
                                valueFormat="DD/MM/YYYY"
                            />
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
                    </> :
                        <>
                            <Grid.Col span={{ base: 12, xs: 4 }}>
                                <ComboCostCenter ComboCostCenterData={ComboCostCenterData} costCenterName={costCenter} companyId={companyId} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 4 }}>
                                <DatePickerInput
                                    required
                                    label="Data de Entrega"
                                    placeholder="Selecione uma Data"
                                    value={deliveryDate}
                                    onChange={setDeliveryDate}
                                    locale="pt-br"
                                    firstDayOfWeek={1}
                                    valueFormat="DD/MM/YYYY"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 6 }}>
                                <ComboDelivery ComboDeliveryData={ComboDeliveryData} deliveryAddress={deliveryAddress} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, xs: 6 }}>
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
                        </>
                    }
                </Grid>
                <Divider mt={30} />
                <Grid>
                    <Grid.Col span={{ base: 12, xs: 6 }}>
                        <Flex gap='md' mt={10}>
                            <Text className={classes.subtitle} mt={1}>
                                Lista de Materiais
                            </Text>
                            <AddProduct draftNumber={draftNumber} upDataDP={UpdataDP} />
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
                                            <Group gap={6}>
                                                <div className={classes.label}>Observações:</div>
                                                <div>
                                                    {record.obs}
                                                </div>
                                            </Group> : <></>}
                                        {record.reference.length > 0 ?
                                            <Group gap={6}>
                                                <Anchor
                                                    variant="subtle"
                                                    href={record.reference}
                                                    target='_blank'
                                                >Link para Referência
                                                </Anchor>
                                            </Group> : <></>}
                                    </Stack>
                                )
                            }}
                            records={dataTable}
                            striped
                            highlightOnHover
                            withTableBorder
                            idAccessor="products.product_id"
                        />
                    </Grid.Col>
                </Grid>
                <Grid type="container" mt={50}>
                    <Grid.Col span={{ base: 12, xs: 12 }}>
                        <Button variant="filled" color="teal.7" size="xs"
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
                        <Button ml={20} variant="filled" color="indigo" size="xs"
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
                                    .then(() => {
                                        resetFields()
                                        router.push("/user/orders")
                                    })

                            }
                            }
                        >Enviar Requisição</Button>
                    </Grid.Col>
                </Grid>
            </Card>
        </Stack>
    )
}