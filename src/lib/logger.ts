export function logInfo(tag: string, msg: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${tag}] ${msg}`);
  }
}
