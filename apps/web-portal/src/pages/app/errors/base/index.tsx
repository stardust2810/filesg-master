import { Button, ErrorInfo, FileSGProps, TextLink } from '@filesg/design-system';

import { CtaContainer, StyledContainer } from './style';

export interface Link {
  label: string;
  to: string;
  isExternal?: boolean;
}
export interface ErrorButton {
  label: string;
  onClickHandler: () => void;
}

type Props = {
  image: string;
  tagText?: string;
  title: string;
  descriptions: string[];
  links?: Link[];
  buttons?: ErrorButton[];
} & FileSGProps;

export function Error({ title, tagText, image, descriptions, links, buttons, style, className }: Props) {
  return (
    <StyledContainer style={style} className={className}>
      <ErrorInfo image={image} tagText={tagText} title={title} descriptions={descriptions}>
        <CtaContainer>
          {links &&
            links.map((link, index) => (
              <TextLink
                type={link.isExternal ? 'ANCHOR' : 'LINK'}
                to={link.to}
                key={index}
                newTab={link.isExternal ?? false}
                endIcon={link.isExternal ? 'sgds-icon-external' : undefined}
                data-testid={`text-link-${link.label}`}
              >
                {link.label}
              </TextLink>
            ))}

          {buttons &&
            buttons.map((button, index) => <Button label={button.label} onClick={button.onClickHandler} key={`button-${index}`} />)}
        </CtaContainer>
      </ErrorInfo>
    </StyledContainer>
  );
}
