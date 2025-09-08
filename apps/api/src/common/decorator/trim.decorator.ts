import { Transform } from 'class-transformer';
import { BadRequestException } from '../exception/common.exception';

export function Trim() {
  return Transform(({ value }): string | null | undefined => {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (value === null || value === undefined) {
      return value;
    }

    throw new BadRequestException();
  });
}
