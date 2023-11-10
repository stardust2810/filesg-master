import { TimestampObject } from 'dynamoose/dist/Schema';

export const generateSchemaTimestampConfig = (): TimestampObject => {
  return {
    createdAt: {
      createdAt: {
        type: {
          value: Date,
          settings: {
            storage: 'iso',
          },
        },
      },
    },
    updatedAt: {
      updatedAt: {
        type: {
          value: Date,
          settings: {
            storage: 'iso',
          },
        },
      },
    },
  };
};
