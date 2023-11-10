import { joeyChanBase64 } from '.';

export const MOCK_TOKEN_FROM_CIRIS = { token: 'mock-token' };

export const MOCK_PHOTO_FROM_CIRIS = {
  registrationInfoDtoList: [
    {
      faces: [
        {
          mugshot: { image: joeyChanBase64, imageFormat: '', recordId: '' },
          thumbnail: { image: joeyChanBase64, imageFormat: '', recordId: '' },
        },
      ],
    },
  ],
};

export const MOCK_USER_DETAILS_FROM_MYINFO = {
  name: 'mock-name',
  email: 'mock@gmail.com',
  phoneNumber: '+6599999999',
};
