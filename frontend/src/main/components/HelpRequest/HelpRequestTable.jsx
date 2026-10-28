import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/HelpRequestUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function HelpRequestTable({ helpRequests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/helprequests/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequests/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id", // accessor is the "key" in the data
    },
    {
      header: "Requester Email",
      accessorKey: "requesterEmail",
    },
    {
      header: "Team Id",
      accessorKey: "teamId",
    },
    {
      header: "Table or Breakout Room",
      accessorKey: "tableOrBreakoutRoom",
    },
    {
      header: "Request Time",
      accessorKey: "requestTime",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Solved",
      accessorKey: "solved",
      cell: ({ cell }) => String(cell.getValue()), // convert boolean to string for display
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "HelpRequestTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "HelpRequestTable"),
    );
  }

  return (
    <OurTable
      data={helpRequests}
      columns={columns}
      testid={"HelpRequestTable"}
    />
  );
}
