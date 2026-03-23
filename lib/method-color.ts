export const GetMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-200 text-blue-800 border-blue-800/10 border-2",
    POST: "bg-green-200 text-green-800 border-green-800/10 border-2",
    PUT: "bg-orange-200 text-orange-800 border-orange-800/10 border-2",
    DELETE: "bg-red-200 text-red-800 border-red-800/10 border-2",
    PATCH: "bg-yellow-200 text-yellow-800 border-yellow-800/10 border-2",
  }
  return (
    colors[method] || "bg-gray-200 text-gray-800 border-gray-800/10 border-2"
  )
}
