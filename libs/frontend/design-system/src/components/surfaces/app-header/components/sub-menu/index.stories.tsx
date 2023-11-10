import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { IconButton } from '../../../../inputs/icon-button';
import { Props, SubMenu } from '.';

export default {
  title: 'Components/Surfaces/Header Sub Menu',
  component: SubMenu,
} as Meta<Props>;

const Template: Story<Props> = (args) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileMenuBtnEl, setProfileMenuBtnEl] = useState<HTMLElement>();

  const onShowHandler = (event) => {
    setShowProfileMenu(true);
    setProfileMenuBtnEl(event.currentTarget);
  };
  const onHideHandler = () => {
    setShowProfileMenu(false);
  };

  return (
    <MemoryRouter>
      <div style={{ margin: '24px' }}>
        <IconButton icon="sgds-icon-person" decoration="GHOST" onClick={onShowHandler} />
        {showProfileMenu && <SubMenu {...args} anchorEl={profileMenuBtnEl} onClose={onHideHandler} />}
      </div>
    </MemoryRouter>
  );
};
export const Default = Template.bind({});
Default.args = {
  items: [
    {
      label: 'SubmenuItem',
      to: '/',
    },
    {
      label: 'SubmenuItem',
      to: '/2',
    },
    {
      label: 'SubmenuItem',
      to: '/3',
    },
    {
      label: 'SubmenuItem',
      to: '/4',
    },
  ],
};
