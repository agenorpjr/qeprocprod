"use client"

import {
    InputBase,
    Combobox,
    useCombobox,
    Input
} from "@mantine/core"

import { useEffect, useState } from "react"
import { getCostCenters } from "@/lib/orders/getOrderData"


export default function ComboCostCenter({ ComboCostCenterData, costCenterName, companyId }) {
    const [selectedCompany, setselectedCostCenter] = useState(costCenterName);
    const [optionsCostCenter, setoptionsCostCenter] = useState([])
    const [search, setSearch] = useState('')

    const optionsCostCenterCombo = optionsCostCenter.filter(({ cost_center, cost_center_id }) => cost_center.toLowerCase().includes(search.toLowerCase().trim()))
        .map(({ cost_center, cost_center_id }) => (
            <Combobox.Option value={cost_center} key={cost_center_id}>
                {cost_center}
            </Combobox.Option>
        ))

    useEffect(() => {
        const getOptions = async () => {
            try {
                const costcenters = await getCostCenters(companyId)
                setoptionsCostCenter(costcenters)
            } catch (err) {
                setoptionsCostCenter([])
             }
        }
        getOptions()
        comboboxcostcenter.selectFirstOption()
    }, [companyId, costCenterName]);

    const comboboxcostcenter = useCombobox({
        onDropdownClose: () => {
            comboboxcostcenter.resetSelectedOption()
            comboboxcostcenter.focusTarget();
            setSearch('');
        },
        onDropdownOpen: () => {
            comboboxcostcenter.focusSearchInput();
        },
    });

    return (
        <Combobox
            store={comboboxcostcenter}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setselectedCostCenter(val);
                comboboxcostcenter.closeDropdown();
                const checkName = () => {
                    optionsCostCenter.map(({ cost_center_id, cost_center }) => {
                        if (val === cost_center) {
                            const tempName = {
                                cost_center_id: cost_center_id,
                                cost_center: cost_center,
                            }
                            ComboCostCenterData(tempName)
                        } else {
                            const tempName = {
                                cost_center_id: '',
                                cost_center: '',
                            }
                        }
                    })
                }
                checkName()
            }}

        >
            <Combobox.Target>
                <InputBase
                    required={companyId === 3 ? false : true}
                    component="button"
                    type="button"
                    pointer
                    label="Centro de Custo"
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"

                    onClick={(event) => {
                        comboboxcostcenter.toggleDropdown()
                    }}
                >
                    {selectedCompany || <Input.Placeholder>Escolha um Centro de Custo</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown >
                <Combobox.Search
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Buscar Centro de Custo"
                />
                <Combobox.Options>
                    {optionsCostCenterCombo.length > 0 ? optionsCostCenterCombo : <Combobox.Empty>Não Encontrado</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}