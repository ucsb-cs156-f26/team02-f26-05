import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/ucsbOrganizationUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("ucsbOrganizationUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It extracts the message from a JSON response object", () => {
      const restoreConsole = mockConsole();

      onDeleteSuccess({ message: "UCSBOrganization with id SKY deleted" });

      expect(mockToast).toHaveBeenCalledWith(
        "UCSBOrganization with id SKY deleted",
      );
      expect(console.log).toHaveBeenCalledWith(
        "UCSBOrganization with id SKY deleted",
      );

      restoreConsole();
    });

    test("It puts the message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onDeleteSuccess("abc");

      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      const cell = { row: { original: { orgCode: "SKY" } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/ucsborganization",
        method: "DELETE",
        params: { orgCode: "SKY" },
      });
    });
  });
});
