import { useArgs } from '@storybook/client-api';
import { Meta, Story } from '@storybook/react';

import { Typography } from '../../data-display/typography';
import { Button } from '../../inputs/button';
import { Drawer, Props } from '.';

export default {
  title: 'Components/Navigation/Drawer',
  component: Drawer,
} as Meta<Props>;

const Template: Story<Props> = (args): JSX.Element => {
  const [, updateArgs] = useArgs();

  const onTempDrawerClose = () => {
    updateArgs({ isOpened: false });
  };

  return (
    <>
      <Button label="Open drawer" onClick={() => updateArgs({ isOpened: true })} />

      <Drawer topPadding="0px" isOpened={args.isOpened} onClose={onTempDrawerClose}>
        <div style={{ padding: '24px', gap: '16px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant={'H3'}>Drawer Content</Typography>
          <Typography variant={'BODY'}>Drawer can also be closed by clicking the backdrop</Typography>
          <Button label="Close drawer" onClick={() => updateArgs({ isOpened: false })} />
        </div>
      </Drawer>
    </>
  );
};

export const Default: Story<Props> = Template.bind({});
Default.args = {};
