import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BadRequestException extends BaseException {
  constructor(message = '잘못된 요청입니다.') {
    super('BAD_REQUEST', message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = '인증되지 않은 사용자입니다.') {
    super('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = '권한이 없습니다.') {
    super('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundException extends BaseException {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super('NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends BaseException {
  constructor(message = '리소스가 이미 존재합니다.') {
    super('CONFLICT', message, HttpStatus.CONFLICT);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message = '서버 내부 오류입니다.') {
    super('INTERNAL_SERVER_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ServiceUnavailableException extends BaseException {
  constructor(message = '서비스를 사용할 수 없습니다.') {
    super('SERVICE_UNAVAILABLE', message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class GatewayTimeoutException extends BaseException {
  constructor(message = '서버 응답이 지연되고 있습니다.') {
    super('GATEWAY_TIMEOUT', message, HttpStatus.GATEWAY_TIMEOUT);
  }
}

export class NotImplementedException extends BaseException {
  constructor(message = '구현되지 않은 기능입니다.') {
    super('NOT_IMPLEMENTED', message, HttpStatus.NOT_IMPLEMENTED);
  }
}

export class PayloadTooLargeException extends BaseException {
  constructor(message = '요청한 데이터가 너무 큽니다.') {
    super('PAYLOAD_TOO_LARGE', message, HttpStatus.PAYLOAD_TOO_LARGE);
  }
}

export class UnsupportedMediaTypeException extends BaseException {
  constructor(message = '지원하지 않는 미디어 타입입니다.') {
    super('UNSUPPORTED_MEDIA_TYPE', message, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}

export class TooManyRequestsException extends BaseException {
  constructor(message = '너무 많은 요청을 보냈습니다.') {
    super('TOO_MANY_REQUESTS', message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ServiceBusyException extends BaseException {
  constructor(message = '서비스가 바쁩니다. 잠시 후 다시 시도해주세요.') {
    super('SERVICE_BUSY', message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class DatabaseException extends BaseException {
  constructor(message = '데이터베이스 오류입니다.') {
    super('DATABASE_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ValidationException extends BaseException {
  constructor(message = '유효성 검사에 실패했습니다.') {
    super('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST);
  }
}
