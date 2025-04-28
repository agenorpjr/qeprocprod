"use client"

import {
    TextInput,
    Combobox,
    useCombobox
} from "@mantine/core"

import { useEffect, useState } from "react"
import { getProjects } from "@/lib/orders/getOrderData"


export default function ComboProject({ ComboProjectData, projectName }) {
    const [selectedProject, setSelectedProject] = useState(projectName);
    const [optionsProject, setOptionsProject] = useState([])

    const shouldFilterProjectOptions = !optionsProject.some(({ project }) => project === selectedProject)
    const filteredProjectOptions = shouldFilterProjectOptions ? optionsProject.filter(({ project }) => project.toLowerCase().includes(selectedProject.toLowerCase().trim()))
        : optionsProject;

    const optionsProjectCombo = filteredProjectOptions
        .map(({ project, project_id }) => (
            <Combobox.Option value={project} key={project_id}>
                {project}
            </Combobox.Option>
        ))

    useEffect(() => {
        const getOptions = async () => {
            try {
                const projects = await getProjects()
                setOptionsProject(projects)
            } catch (err) { }
        }
        getOptions()
        comboboxproject.selectFirstOption()
    }, []);

    const comboboxproject = useCombobox({
        onDropdownClose: () => {
            comboboxproject.resetSelectedOption()
        }
    });

    return (
        <Combobox
            store={comboboxproject}
            width={500}
            position="bottom-start"
            withArrow
            onOptionSubmit={(val) => {
                ComboProjectData(val)
                setSelectedProject(val);
                comboboxproject.closeDropdown();
            }}
        >
            <Combobox.Target>
                <TextInput
                    label="Projeto"
                    placeholder="Projeto"
                    value={selectedProject}
                    onChange={(event) => {
                        setSelectedProject(event.currentTarget.value);
                        comboboxproject.openDropdown();
                        ComboProjectData(event.currentTarget.value)
                    }}
                    onClick={() => comboboxproject.openDropdown()}
                    onFocus={() => comboboxproject.openDropdown()}
                    onBlur={() => comboboxproject.closeDropdown()}
                />
            </Combobox.Target>

            <Combobox.Dropdown>

                <Combobox.Options>
                    {optionsProjectCombo.length > 0 ? optionsProjectCombo : <Combobox.Empty>Digite o Projeto</Combobox.Empty>}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}