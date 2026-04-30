export const getStatusStyle = (status) => {
  if (status === "Active") return "bg-blue-100 text-blue-700";
  if (status === "Invited") return "bg-yellow-100 text-yellow-700";
  if (status === "Inactive") return "bg-gray-100 text-yellow-700";
  if (status === "Archived") return "bg-red-100 text-yellow-700";

  return "bg-gray-100 text-gray-600";
};