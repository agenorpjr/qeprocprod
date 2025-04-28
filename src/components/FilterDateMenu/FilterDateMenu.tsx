import { Button, Menu } from '@mantine/core';

const FilterDateMenu = () => {
  const datadehj = new Date(Date.now()).toLocaleString('pt-BR').split(',')[0]
  return (
    <Menu shadow="md" width={120}>
      <Menu.Target>
        <Button variant="primary">
          Hoje: {datadehj}
        </Button>
      </Menu.Target>
    </Menu>
  );
};

export default FilterDateMenu;
