import { FileSGProps, Typography } from '@filesg/design-system';
import { isValidElement } from 'react';

import { Button } from './style';

type Props = {
  title: string | React.ReactElement;
  index: number;
  active: boolean;
  disabled?: boolean;
  setSelectedTab: (index: number, e) => void;
  onClick?: () => void;
} & FileSGProps;

export const TabTitle = ({ title, index, active, disabled = false, setSelectedTab, onClick, className, ...rest }: Props) => {
  const handleOnClick = (e) => {
    setSelectedTab(index, e);
    onClick?.();
  };

  return (
    <li style={{ zIndex: 2 }} className={className} role="tab" aria-selected={active}>
      <Button
        className={`fsg-tab-title ${active ? 'fsg-tab-title-active' : undefined}`}
        onClick={(e) => handleOnClick(e)}
        active={active}
        disabled={disabled}
        data-testid={rest['data-testid']}
      >
        {isValidElement(title) ? (
          title
        ) : (
          <Typography variant="BODY" bold={active ? 'FULL' : undefined}>
            {title}
          </Typography>
        )}
      </Button>
    </li>
  );
};
