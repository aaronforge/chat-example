export type TErrorLike = {
  code?: unknown;
  message?: unknown;
  error?: unknown;
  statusCode?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function toErrorResponse(res: unknown): {
  code: string;
  message: string;
} {
  // 문자열 메시지인 경우
  if (typeof res === 'string') {
    return { code: 'INTERNAL_ERROR', message: res };
  }

  // 객체 모양인 경우 (Nest의 기본 HttpException 응답 등)
  if (isRecord(res)) {
    const obj = res as TErrorLike;

    // code
    const code = typeof obj.code === 'string' ? obj.code : 'BAD_REQUEST';

    // message (string | string[] | 기타)
    if (typeof obj.message === 'string') {
      return { code, message: obj.message };
    }
    if (
      Array.isArray(obj.message) &&
      obj.message.every((m) => typeof m === 'string')
    ) {
      return { code, message: obj.message.join(', ') };
    }

    // Nest 기본 필드 fallback
    if (typeof obj.error === 'string') {
      return { code, message: obj.error };
    }
  }

  // 그 외 알 수 없는 형태
  return { code: 'ERROR', message: 'Unexpected error' };
}
