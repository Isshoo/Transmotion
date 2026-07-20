/**
 * Ambil pesan error dari response Axios
 */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "An error occurred, try again."
  );
}
