/**
 * This file is to provide a empty mock for @nestjs/swagger (ApiProperty) decorator
 * so as to not bloat the output bundle
 *
 * @nestjs/swagger (ApiProperty) is for backend services to generate swagger documentation
 * and is not required in frontend code as well.
 *
 * This is to faciliate the decoration of (dto) classes in `common`
 */

module.exports = {
  ApiProperty: () => {
    // noop
  },

  ApiPropertyOptional: () => {
    // noop
  },
};
