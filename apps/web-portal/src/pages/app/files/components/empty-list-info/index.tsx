import { Info } from '@filesg/design-system';

import EmptyListError from '../../../../../assets/images/common/error/no-activities-files-error.svg';

type Props = {
  title?: string;
};

export const EmptyListInfo = ({ title = 'No files yet!' }: Props) => {
  return (
    <Info
      image={EmptyListError}
      title={title}
      descriptions={[
        'You have not been issued any files through FileSG.',
        'FileSG is a new digital document service. Only selected government documents will be issued to your FileSG account.',
      ]}
    />
  );
};
