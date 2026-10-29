import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Dining Commons Code", "Name", "Station"];
  const testId = "UCSBDiningCommonsMenuItemForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expect(
      screen.getByTestId(`${testId}-diningCommonsCode`),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-name`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-station`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    const item = ucsbDiningCommonsMenuItemFixtures.oneMenuItem;
    renderForm({ initialContents: item });

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    const idInput = screen.getByTestId(`${testId}-id`);
    expect(idInput).toHaveValue("1");
    expect(idInput).toBeDisabled();
    expect(screen.getByTestId(`${testId}-diningCommonsCode`)).toHaveValue(
      item.diningCommonsCode,
    );
    expect(screen.getByTestId(`${testId}-name`)).toHaveValue(item.name);
    expect(screen.getByTestId(`${testId}-station`)).toHaveValue(item.station);
  });

  test("uses the default and custom button labels", async () => {
    const { unmount } = renderForm();
    expect(await screen.findByTestId(`${testId}-submit`)).toHaveTextContent(
      "Create",
    );
    unmount();

    renderForm({ buttonLabel: "Update" });
    expect(await screen.findByTestId(`${testId}-submit`)).toHaveTextContent(
      "Update",
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows required messages and does not submit when empty", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("each field is individually required", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    const values = {
      diningCommonsCode: "ortega",
      name: "Pasta",
      station: "Entree",
    };
    const messages = {
      diningCommonsCode: "Dining Commons Code is required.",
      name: "Name is required.",
      station: "Station is required.",
    };

    for (const missing of Object.keys(values)) {
      for (const [field, value] of Object.entries(values)) {
        fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
          target: { value: field === missing ? "" : value },
        });
      }
      fireEvent.click(screen.getByTestId(`${testId}-submit`));
      expect(await screen.findByText(messages[missing])).toBeInTheDocument();
      expect(screen.getAllByText(/is required/)).toHaveLength(1);
    }
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only values for each field", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    const values = {
      diningCommonsCode: "ortega",
      name: "Pasta",
      station: "Entree",
    };
    const messages = {
      diningCommonsCode: "Dining Commons Code is required.",
      name: "Name is required.",
      station: "Station is required.",
    };

    for (const blank of Object.keys(values)) {
      for (const [field, value] of Object.entries(values)) {
        fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
          target: { value: field === blank ? "   " : value },
        });
      }
      fireEvent.click(screen.getByTestId(`${testId}-submit`));
      expect(await screen.findByText(messages[blank])).toBeInTheDocument();
      expect(screen.getAllByText(/is required/)).toHaveLength(1);
      expect(submitAction).not.toHaveBeenCalled();
    }
  });

  test("calls submitAction with valid values and no errors", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(await screen.findByTestId(`${testId}-diningCommonsCode`), {
      target: { value: "ortega" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-name`), {
      target: { value: "Pasta" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-station`), {
      target: { value: "Entree" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(submitAction.mock.calls[0][0]).toEqual({
      diningCommonsCode: "ortega",
      name: "Pasta",
      station: "Entree",
    });
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });
});
