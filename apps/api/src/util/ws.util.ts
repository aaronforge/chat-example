/**
 * WebSocket 채널 네임스페이스와 이벤트를 조합하여 고유한 채널 문자열을 생성합니다.
 */
export function getWsChannel(namespace: string, event: string) {
  return `${namespace}:${event}`;
}
