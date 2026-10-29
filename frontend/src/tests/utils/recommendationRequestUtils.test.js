import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/recommendationRequestUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("recommendationRequestUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It extracts the message from a JSON response object", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess({ message: "RecommendationRequest with id 1 deleted" });

      // assert
      expect(mockToast).toHaveBeenCalledWith(
        "RecommendationRequest with id 1 deleted",
      );
      expect(console.log).toHaveBeenCalledWith(
        "RecommendationRequest with id 1 deleted",
      );

      restoreConsole();
    });

    test("It puts the message on console.log and in a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess("abc");

      // assert
      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      // arrange
      const cell = { row: { original: { id: 17 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/recommendationrequests",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
