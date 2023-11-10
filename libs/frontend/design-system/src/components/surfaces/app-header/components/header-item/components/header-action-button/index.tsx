import { useShouldRender } from '../../../../../../../hooks/useShouldRender';
import { FSG_DEVICES, RESPONSIVE_VARIANT } from '../../../../../../../utils/constants';
import { ActionProps, FileSGProps } from '../../../../../../../utils/typings';
import { Button } from '../../../../../../inputs/button';
import { IconButton } from '../../../../../../inputs/icon-button';

export type HeaderActionItem = ActionProps & FileSGProps & { onDrawerClose?: () => void };

export const HeaderActionButton = ({ label, icon, onClick, onDrawerClose, ...rest }: HeaderActionItem) => {
  const isSmallerThanNormalTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const onButtonClick = (e) => {
    onDrawerClose?.();
    onClick(e);
  };
  switch (true) {
    case !!label && !!icon:
      return (
        <Button
          aria-label={rest['aria-label'] ?? undefined}
          data-testid={rest['data-testid']}
          decoration="OUTLINE"
          size={isSmallerThanNormalTablet ? 'SMALL' : 'NORMAL'}
          label={label!}
          endIcon={icon}
          onClick={onButtonClick}
        ></Button>
      );
    case !!icon:
      return (
        <IconButton
          aria-label={rest['aria-label'] ?? undefined}
          data-testid={rest['data-testid']}
          decoration="GHOST"
          icon={icon ? icon : 'sgds-icon-person'}
          color="DEFAULT"
          onClick={onButtonClick}
        />
      );
    case !!label:
      return (
        <Button
          aria-label={rest['aria-label'] ?? undefined}
          data-testid={rest['data-testid']}
          decoration="OUTLINE"
          size={isSmallerThanNormalTablet ? 'SMALL' : 'NORMAL'}
          label={label!}
          onClick={onButtonClick}
        ></Button>
      );
    default:
      return null;
  }
};
