import { isValidSgMobile } from '..';

describe('validators', () => {
  describe('isValidSgMobile', () => {
    it('should return true when string provided is a valid sg contact pattern', () => {
      expect(isValidSgMobile('+6581111111')).toBeTruthy();
      expect(isValidSgMobile('+6591111111')).toBeTruthy();
    });

    it('should return false when string does not follow sg contact pattern', () => {
      expect(isValidSgMobile('THISISSTH+6581111111')).toBeFalsy(); // extra char
      expect(isValidSgMobile('$@#%+6581111111')).toBeFalsy(); // extra special char
      expect(isValidSgMobile(' +6581111111')).toBeFalsy(); // extra space

      expect(isValidSgMobile('+6591111111MORETHINGS')).toBeFalsy();
      expect(isValidSgMobile('+6591111111S')).toBeFalsy(); // extra char
      expect(isValidSgMobile('+6591111111%')).toBeFalsy(); // extra special char
      expect(isValidSgMobile('+65911111110')).toBeFalsy(); // extra digit

      expect(isValidSgMobile('TEST+6591111111TEST')).toBeFalsy(); // extra char infront and back of mobile

      expect(isValidSgMobile('+658 1111111')).toBeFalsy(); // extra space

      expect(isValidSgMobile('+65 81111111')).toBeFalsy(); // extra space

      expect(isValidSgMobile('+65 71111111')).toBeFalsy(); // extra space
    });
  });
});
