export const GetMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-800 border-blue-800/20 border-2",
    POST: "bg-green-500/10 text-green-800 border-green-800/20 border-2",
    PUT: "bg-yellow-500/10 text-yellow-800 border-yellow-800/20 border-2",
    DELETE: "bg-red-500/10 text-red-800 border-red-800/20 border-2",
    PATCH: "bg-purple-500/10 text-purple-800 border-purple-800/20 border-2",
  }
  return (
    colors[method] || "bg-gray-500/10 text-gray-800 border-gray-800/20 border-2"
  )
}
