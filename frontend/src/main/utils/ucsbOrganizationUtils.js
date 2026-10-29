import { toast } from "react-toastify";

// The backend's DELETE endpoint returns JSON like { message: "..." },
// so we pull out the message string before showing it in a toast.
export function onDeleteSuccess(response) {
  const message = typeof response === "string" ? response : response.message;
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/ucsborganization",
    method: "DELETE",
    params: {
      orgCode: cell.row.original.orgCode,
    },
  };
}
