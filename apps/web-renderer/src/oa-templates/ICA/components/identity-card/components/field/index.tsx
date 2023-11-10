import { Container, Title, Value } from './style';

interface Props {
  title: string;
  value: React.ReactNode;
}

export const Field = ({ title, value }: Props) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Container>
  );
};
