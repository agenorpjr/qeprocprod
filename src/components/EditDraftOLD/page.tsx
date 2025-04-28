import {
    ActionIcon,
    Button,
    Grid,
    Group,
    Modal,
    useModalsStack,

} from "@mantine/core";

import classes from './editdraft.module.css'
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getDraftById } from "@/lib/orders/getOrderData";
import ComboCompany from "../ComboCompany/ComboCompany";
import ComboCostCenter from "../ComboCostCenter/CostCenter";
import ComboProject from "../ComboProject/ComboProject";
import { DatePickerInput } from "@mantine/dates";
import ComboDelivery from "../ComboDelivery/ComboDelivery";

export default function EditDraft({ dId }) {
    const stack = useModalsStack(['editdraft']);
    const [draft, SetDraft] = useState([])

    const [companyName, setCompanyName] = useState('')
    const [costCenter, setCostCenter] = useState(0)
    const [project, setProject] = useState(0)
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
    const [deliveryAddress, setDeliveryAddess] = useState('')


    useEffect(() => {
        const draft = async () => {
            try {
                const dr = await getDraftById(dId)
                SetDraft(dr)
                setDeliveryDate(dr?.delivery_at)
            } catch (err) { }
        }
        draft()
    }, [])

    const ComboCompanyData = (ComboCompanyData: string) => {
        setCompanyName(ComboCompanyData.company)
    }

    const ComboCostCenterData = (ComboCostCenterData: any) => {
        if (ComboCostCenterData.const_center === 0) {
            setCostCenter(0)
        } else {
            setCostCenter(ComboCostCenterData.cost_center_id)
        }

    }

    const ComboProjectData = (ComboProjectData: any) => {
        if (ComboProjectData.project === 0) {

        } else {

        }

    }

    const ComboDeliveryData = (ComboDeliveryData: string) => {
        setDeliveryAddess(ComboDeliveryData)
    }

    return (
        <>
            <Modal.Stack>
                <Modal {...stack.register('editdraft')} title="Editar Rascunho" size="100%" className={classes.title}>

                    <Grid type="container" mt={10} className={classes.hsize}>
                        <Grid.Col span={4}>
                            <ComboCompany ComboCompanyData={ComboCompanyData} companyName={draft.companies?.company} />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            {draft.companies?.company === "HOLLYWOOD" ? <ComboProject ComboProjectData={ComboProjectData} projectName={draft.project} /> : <ComboCostCenter ComboCostCenterData={ComboCostCenterData} costCenterName={draft.cost_center} />}
                        </Grid.Col>
                        <Grid.Col span={4}>
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
                        <Grid.Col span={8}>
                            <ComboDelivery ComboDeliveryData={ComboDeliveryData} deliveryAddress={draft.delivery_address} />
                        </Grid.Col>
                    </Grid>
                    <Group justify="flex-start">
                        <Button onClick={() => {

                            console.log('testeteste')
                        }}
                            color="blue.9">
                            Salvar Alterações
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
                    stack.open("editdraft")
                }}
            >
                <IconEdit size={16} />
            </ActionIcon>
        </>
    )
}