export const isValidImageUrl = (url?: string | null): url is string => {
  if (!url) return false
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return false
  if (url.includes('localhost:4000') || url.includes(':4000/uploads')) return false
  return true
}
