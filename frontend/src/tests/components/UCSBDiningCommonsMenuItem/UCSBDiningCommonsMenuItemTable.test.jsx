import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["id", "Dining Commons Code", "Name", "Station"];
  const expectedFields = ["id", "diningCommonsCode", "name", "station"];
  const testId = "UCSBDiningCommonsMenuItemTable";
  const items = ucsbDiningCommonsMenuItemFixtures.threeMenuItems;

  const renderTable = (menuItems, currentUser) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemTable
            menuItems={menuItems}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const expectContent = () => {
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    const expectedRows = [
      ["2", "carrillo", "Cheeseburger", "Grill (Cafe)"],
      ["3", "de-la-guerra", "Chicken Caesar Salad", "Salads/Deli"],
      ["4", "portola", "Vegetable Stir Fry", "Entree Specials"],
    ];
    expectedRows.forEach((row, i) => {
      expectedFields.forEach((field, j) => {
        expect(
          screen.getByTestId(`${testId}-cell-row-${i}-col-${field}`),
        ).toHaveTextContent(row[j]);
      });
    });
  };

  test("renders empty table correctly", () => {
    renderTable([], currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    renderTable(items, currentUserFixtures.adminUser);

    expectContent();

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    renderTable(items, currentUserFixtures.userOnly);

    expectContent();

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    renderTable(items, currentUserFixtures.adminUser);

    fireEvent.click(
      await screen.findByTestId(`${testId}-cell-row-0-col-Edit-button`),
    );

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/diningcommonsmenuitem/edit/2",
      ),
    );
  });

  test("Delete button calls delete callback", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/ucsbdiningcommonsmenuitem")
      .reply(200, { message: "Menu item deleted" });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderTable(items, currentUserFixtures.adminUser);

    fireEvent.click(
      await screen.findByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe(
      "/api/ucsbdiningcommonsmenuitem",
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
    await waitFor(() =>
      expect(logSpy).toHaveBeenCalledWith({ message: "Menu item deleted" }),
    );
    logSpy.mockRestore();
  });
});
