"use client"

import {
    InputBase,
    Combobox,
    useCombobox,
    Input
} from "@mantine/core"

import React, { useEffect, useState } from "react"
import { getCompanies } from "@/lib/orders/getOrderData"


export default function ComboCompany({ ComboCompanyData, companyName}) {
    const [selectedCompany, setselectedCompany] = useState(companyName);
    const [optionsCompany, setoptionsCompany] = useState([])
    const [search, setSearch] = useState('')

    const optionsCompanyCombo = optionsCompany.filter(({ company }) => company.toLowerCase().includes(search.toLowerCase().trim()))
        .map(({ company, company_id }) => (
            <Combobox.Option value={company} key={company_id}>
                {company}
            </Combobox.Option>
        ))

    useEffect(() => {
        const getOptions = async () => {
            try {
                const companies = await getCompanies()
                setoptionsCompany(companies)
                
            } catch (err) { }
        }
        getOptions()
        comboboxcompany.selectFirstOption()
    }, []);


    const comboboxcompany = useCombobox({
        onDropdownClose: () => {
            comboboxcompany.resetSelectedOption()
            comboboxcompany.focusTarget();
            setSearch('');
        },
        onDropdownOpen: () => {
            comboboxcompany.focusSearchInput();
        },
    });

    return (
        <Combobox
            store={comboboxcompany}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setselectedCompany(val);
                comboboxcompany.closeDropdown();
                const checkName = () => {
                    optionsCompany.map(({ company_id, company, cnpj }) => {
                        if (val === company) {
                            const tempName = {
                                company_id: company_id,
                                company: company,
                                cnpj: cnpj
                            }
                            ComboCompanyData(tempName)
                        } else {
                            const tempName = {
                                company_id: "",
                                company: "",
                                cnpj: ""
                            }
                        }
                    })
                }
                checkName()
            }}

        >
            <Combobox.Target>
                <InputBase
                    required
                    component="button"
                    type="button"
                    pointer
                    label="Empresa"
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    onClick={(event) => {
                        comboboxcompany.toggleDropdown()
                    }}
                >
                    {selectedCompany || <Input.Placeholder>Escolha uma Empresa</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown >
                <Combobox.Search
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Buscar Empresa"
                />
                <Combobox.Options>
                    {optionsCompanyCombo.length > 0 ? optionsCompanyCombo : <Combobox.Empty>Não Encontrado</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}