import { Row } from 'sgds-govtech-react';
import styled from "styled-components";

export const StyledRow = styled(Row)`
width: 100%;
  margin: 0;

  &:last-child {
    margin-bottom: 0;
  }

  &:not(:last-child) {
    margin-bottom: 0;
  }
`; // SGDS css applies negative margin-bottom to rows in :not(:last-child) & :last-child
