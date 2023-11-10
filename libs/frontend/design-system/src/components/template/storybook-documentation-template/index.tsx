import { StyledPageLayout } from './style';

type Props = {
  title: string;
  children: React.ReactNode | React.ReactNode[];
};

export const DocumentationTemplate = ({ title, children }: Props) => {
  return (
    <StyledPageLayout>
      <h1>{title}</h1>
      {children}
    </StyledPageLayout>
  );
};
