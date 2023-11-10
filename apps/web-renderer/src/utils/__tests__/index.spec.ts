import { convertToCustomDateString } from '..';

describe('utils', () => {
  describe('convertToCustomDateString', () => {
    it('invalid date string will return rubbish', () => {
      expect(convertToCustomDateString('asdasdasda')).toEqual('asdasdasda');
    });

    it('full date should be transformed correctly', () => {
      expect(convertToCustomDateString('1995-08-21')).toEqual('21 AUG 1995');
    });

    it('day should not be padded with 0', () => {
      expect(convertToCustomDateString('1995-08-01')).toEqual('1 AUG 1995');
    });

    it('partial date witout day should be transformed correctly', () => {
      expect(convertToCustomDateString('1995-08-00')).toEqual('AUG 1995');
    });

    it('partial date without day and month should be transformed correctly', () => {
      expect(convertToCustomDateString('1995-00-00')).toEqual('1995');
    });

    it('partial date without day but with month should be transformed correctly', () => {
      expect(convertToCustomDateString('1995-00-01')).toEqual('1995');
    });
  });
});
