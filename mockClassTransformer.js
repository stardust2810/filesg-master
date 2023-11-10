/**
 * This file is to provide a empty mock for class-transformer (Type) decorator
 * so as to not bloat the output bundle
 *
 * class-transformer (Type) is for backend services to perform input validation
 * and is not required in frontend code as well.
 *
 * This is to faciliate the decoration of (dto) classes in `common`
 */

module.exports = {
  Type: () => {
    // noop
  },
  Transform: () => {
    // noop
  },
};
