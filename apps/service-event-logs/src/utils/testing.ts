import { fn, Mock } from 'jest-mock';
import { Model } from 'nestjs-dynamoose';

type DynamooseModel<T, K> = Model<T, K>;
type Transaction<T, K> = Record<keyof DynamooseModel<T, K>['transaction'], Mock<any>>;
type MockModel<T, K> = Omit<Record<keyof DynamooseModel<T, K>, Mock<any>>, 'transaction'> & { transaction: Transaction<T, K> };

export const generateDdbModelMock = <T, K>(): MockModel<T, K> => ({
  create: fn(),
  get: fn(),
  update: fn(),
  delete: fn(),
  query: fn().mockReturnValue({
    eq: fn().mockReturnValue({
      attributes: fn().mockReturnValue({ exec: fn() }),
    }),
  }),
  scan: fn(),
  batchGet: fn(),
  batchPut: fn(),
  batchDelete: fn(),
  serializeMany: fn(),
  transaction: {
    get: fn(),
    create: fn(),
    delete: fn(),
    update: fn(),
    condition: fn(),
  },
});
