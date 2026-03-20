/** Número exibido na loja (ex.: #1042) */
export function displayOrderNumber(orderNumber: number): string {
  return `#${orderNumber}`;
}

/** Valor copiado / informado no suporte — só dígitos, fácil de ditar */
export function copyOrderNumber(orderNumber: number): string {
  return String(orderNumber);
}
