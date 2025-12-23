export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString();
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
