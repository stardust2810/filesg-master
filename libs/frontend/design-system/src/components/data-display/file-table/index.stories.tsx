import { Meta, Story } from '@storybook/react';
import styled from 'styled-components';

import { Color, FileIcon } from '../../..';
import { generateEllipsisFileNameParts } from '../../../utils/helper';
import { Typography } from '../typography';
import { FileTable, Props, TableColumns, TableRows } from '.';
import { StyledFileNameEndText, StyledFileNameSpan, StyledStatusText, StyledTextButton } from './style';

const StyledColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default {
  title: 'Components/Data Display/File Table',
  component: FileTable,
  argTypes: {},
} as Meta<Props>;

const columns: TableColumns = [
  {
    field: 'documentType',
    width: 32,
    minWidth: 32,
    renderCell: ({ cellData }) => <FileIcon type={cellData} variant="solid" size="ICON_LARGE" />,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 900,
    ellipsis: true,
    ellipsisLine: 1,
    renderCell: ({ cellData, rowData }) => {
      const { front, back } = generateEllipsisFileNameParts(cellData, 8);

      return (
        <StyledTextButton
          label={
            <StyledFileNameSpan>
              <Typography variant="BODY" isEllipsis ellipsisLine={1}>
                {front}
              </Typography>
              <StyledFileNameEndText variant="BODY">{back}</StyledFileNameEndText>
            </StyledFileNameSpan>
          }
          onClick={() => console.log(`View ${rowData.id}`)}
        />
      );
    },
  },
  {
    field: 'updatedAt',
    headerName: 'Updated',
    width: 260,
    minWidth: 120,
    hiddenOn: 'MOBILE',
    renderCell: ({ cellData, rowData }) => (
      <StyledColumnContainer>
        <Typography variant="SMALL">{cellData}</Typography>
        <Typography variant="SMALL" color={Color.GREY60}>
          by {rowData.agencyCode}
        </Typography>
      </StyledColumnContainer>
    ),
  },
  {
    field: 'expireAt',
    headerName: 'Status',
    width: 260,
    minWidth: 80,
    hiddenOn: 'TABLET',
    renderCell: ({ cellData }) => {
      if (cellData) {
        return (
          <StyledColumnContainer>
            <Typography variant="SMALL" color={Color.GREY60}>
              Valid till
            </Typography>
            <Typography variant="SMALL">{cellData}</Typography>
          </StyledColumnContainer>
        );
      } else {
        return (
          <StyledStatusText variant="SMALL" bold="FULL">
            -
          </StyledStatusText>
        );
      }
    },
  },
];

const rows: TableRows = [...Array(10).fill(1)].map((_, index) => {
  return {
    id: `${index + 1}-user${index + 1}-${index + 1}`,
    agencyCode: 'ICA',
    name:
      index % 2 === 0 ? `file-very-very-very-very-very-very-very-very-very-very-very-very-long-${index + 1}.oa` : `file-${index + 1}.jpg`,
    documentType: 'oa',
    updatedAt: `0${index + 1}/08/2021 10:00`,
    expireAt: `0${index + 1}/09/2021`,
  };
});

export const Default: Story<Props> = (args) => {
  return <FileTable {...args} />;
};

Default.args = {
  columns,
  rows,
  checkboxSelection: true,
  onSelectionModelChange: (ids) => {
    console.log({ ids });
  },
};
