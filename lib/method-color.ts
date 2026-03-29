export const GetMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-green-100 text-green-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
    PATCH: "bg-purple-100 text-purple-700",
    HEAD: "bg-blue-100 text-blue-700",
    OPTIONS: "bg-purple-100 text-purple-700",
  }
  return (
    colors[method] || "bg-gray-200 text-gray-800 border-gray-800/10 border-2"
  )
}
