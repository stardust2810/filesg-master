import { Color } from '../../../../../styles/color';
import { IconLiterals } from '../../../../../typings/icon-literals';
import { TEST_IDS } from '../../../../../utils/constants';
import { ActionProps, FileSGProps, NavProps } from '../../../../../utils/typings';
import { Icon } from '../../../icon';
import { Typography } from '../../../typography';
import { StyledIconButton, StyledListActionButton, StyledListNavLink, StyledTextWrapper } from './style';

export type IListItem = {
  dropdowns?: IListItem[];
  isNested?: boolean;
  expandableProps?: ExpandableProps;
} & (NavProps | ActionProps);

export type ExpandableProps = IsExpandableProps | NotExpandableProps;
interface IsExpandableProps {
  isExpandable: true;
  isExpanded: boolean;
  onExpandBtnClick: () => void;
  onLabelClick: () => void;
}

interface NotExpandableProps {
  isExpandable: false;
  isExpanded?: boolean;
  onExpandBtnClick?: () => void;
  onLabelClick?: () => void;
}

type Props = IListItem & FileSGProps;

const ctaLabel = (label: string, startIcon?: IconLiterals, expandableProps?: ExpandableProps) => (
  <>
    {startIcon && <Icon color={Color.GREY60} icon={startIcon} size="ICON_MINI" />}

    <StyledTextWrapper className="list-item-cta-label" onClick={expandableProps?.onLabelClick}>
      <Typography variant="BODY">{label}</Typography>
    </StyledTextWrapper>
  </>
);

export const ListItem = (props: Props) => {
  if ('to' in props) {
    const { isNested = false, label, to, icon, className, expandableProps, ariaLabel, ...rest } = props;
    const onClickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      expandableProps?.onExpandBtnClick!();
    };
    return (
      <li>
        <StyledListNavLink
          $isNested={isNested}
          className={className}
          to={to}
          data-testid={rest['data-testid'] ?? `${TEST_IDS.LIST_NAVIGATION_ITEM}`}
          aria-label={ariaLabel ? ariaLabel : label}
          aria-expanded={expandableProps?.isExpanded}
        >
          {ctaLabel(label!, icon, expandableProps)}
          {expandableProps?.isExpandable ? (
            <StyledIconButton
              decoration="GHOST"
              icon={expandableProps.isExpanded ? 'sgds-icon-chevron-up' : 'sgds-icon-chevron-down'}
              aria-label={expandableProps.isExpanded ? 'Click to show less' : 'Click to show more'}
              color="DEFAULT"
              size="SMALL"
              onClick={onClickHandler}
            />
          ) : null}
        </StyledListNavLink>
      </li>
    );
  }

  const { isNested = false, label, icon, className, expandableProps, onClick, ...rest } = props;
  return (
    <li>
      <StyledListActionButton
        $isNested={isNested}
        className={className}
        onClick={onClick}
        data-testid={rest['data-testid'] ?? `${TEST_IDS.LIST_ACTION_ITEM}`}
      >
        {ctaLabel(label!, icon, expandableProps)}
      </StyledListActionButton>
    </li>
  );
};
