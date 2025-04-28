"use client"

import {
    TextInput,
    Combobox,
    useCombobox
} from "@mantine/core"

import { useEffect, useState } from "react"
import { getDeliveries } from "@/lib/orders/getOrderData"


export default function ComboDelivery({ ComboDeliveryData, deliveryAddress }) {
    const [selectedDelivery, setSelectedDelivery] = useState(deliveryAddress);
    const [optionsDelivery, setOptionsDelivery] = useState([])

    const shouldFilterDeliveryOptions = !optionsDelivery.some(({ address }) => address === selectedDelivery)
    const filteredDeliveryOptions = shouldFilterDeliveryOptions ? optionsDelivery.filter(({ address }) => address.toLowerCase().includes(selectedDelivery.toLowerCase().trim()))
        : optionsDelivery;

    const optionsDeliveryCombo = filteredDeliveryOptions
        .map(({ address, address_id }) => (
            <Combobox.Option value={address} key={address_id}>
                {address}
            </Combobox.Option>
        ))

    useEffect(() => {
        const getOptions = async () => {
            try {
                const deliveries = await getDeliveries()
                setOptionsDelivery(deliveries)

            } catch (err) { }
        }
        getOptions()
        comboboxdelivery.selectFirstOption()
    }, []);

    // useEffect(() => {
    //     if (selectedDelivery === null){
    //         console.log('ta tentando aqui')
    //         setSelectedDelivery("")
    //     }
    // }, [selectedDelivery])

    const comboboxdelivery = useCombobox({
        onDropdownClose: () => {
            comboboxdelivery.resetSelectedOption()
        }
    });

    return (
        <Combobox
            store={comboboxdelivery}
            width={500}
            position="bottom-start"
            withArrow
            onOptionSubmit={(val) => {
                ComboDeliveryData(val)
                setSelectedDelivery(val);
                comboboxdelivery.closeDropdown();
            }}
        >
            <Combobox.Target>
                <TextInput
                required
                    label="Endereço de Entrega"
                    placeholder="Endereço de Entrega"
                    value={selectedDelivery}
                    onChange={(event) => {
                        setSelectedDelivery(event.currentTarget.value);
                        comboboxdelivery.openDropdown();
                        ComboDeliveryData(event.currentTarget.value)
                    }}
                    onClick={() => comboboxdelivery.openDropdown()}
                    onFocus={() => comboboxdelivery.openDropdown()}
                    onBlur={() => comboboxdelivery.closeDropdown()}
                />
            </Combobox.Target>

            <Combobox.Dropdown>

                <Combobox.Options>
                    {optionsDeliveryCombo.length > 0 ? optionsDeliveryCombo : <Combobox.Empty>Digite o Endereço</Combobox.Empty>}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}