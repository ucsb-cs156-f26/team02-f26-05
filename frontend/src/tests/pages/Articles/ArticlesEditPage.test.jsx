import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Handy Spring Utility Classes",
        url: "https://example.com/spring",
        explanation: "A lot of really useful classes are built into Spring",
        email: "phtcon@ucsb.edu",
        dateAdded: "2022-04-19T00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Testing Implementation Details",
        url: "https://kentcdodds.com/blog/testing-implementation-details",
        explanation: "Why tests should focus on behavior",
        email: "cgaucho@ucsb.edu",
        dateAdded: "2022-05-03T12:30",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    const renderPage = (props = {}) =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage {...props} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

    test("renders without crashing", async () => {
      renderPage();
      await screen.findByText(/Welcome/);
      await screen.findByTestId("ArticlesForm-title");
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      renderPage();

      await screen.findByTestId("ArticlesForm-title");

      expect(screen.getByTestId("ArticlesForm-id")).toHaveValue("17");
      expect(screen.getByTestId("ArticlesForm-title")).toHaveValue(
        "Handy Spring Utility Classes",
      );
      expect(screen.getByTestId("ArticlesForm-url")).toHaveValue(
        "https://example.com/spring",
      );
      expect(screen.getByTestId("ArticlesForm-explanation")).toHaveValue(
        "A lot of really useful classes are built into Spring",
      );
      expect(screen.getByTestId("ArticlesForm-email")).toHaveValue(
        "phtcon@ucsb.edu",
      );
      expect(screen.getByTestId("ArticlesForm-dateAdded")).toHaveValue(
        "2022-04-19T00:00",
      );
      expect(screen.getByTestId("ArticlesForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      renderPage();

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Testing Implementation Details" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: {
          value: "https://kentcdodds.com/blog/testing-implementation-details",
        },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "Why tests should focus on behavior" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
        target: { value: "cgaucho@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
        target: { value: "2022-05-03T12:30" },
      });

      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Testing Implementation Details",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Testing Implementation Details",
          url: "https://kentcdodds.com/blog/testing-implementation-details",
          explanation: "Why tests should focus on behavior",
          email: "cgaucho@ucsb.edu",
          dateAdded: "2022-05-03T12:30",
        }),
      ); // posted object
    });

    test("does not navigate away after a successful update in storybook mode", async () => {
      renderPage({ storybook: true });

      await screen.findByTestId("ArticlesForm-title");
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText("Edit Article")).toBeInTheDocument();
    });

    test("Invalid data shows errors and is not saved", async () => {
      renderPage();

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
        target: { value: "not-an-email" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

      await screen.findByText(/Title is required./);
      expect(
        screen.getByText(/Email must be a valid email address/),
      ).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Cancel goes back without saving", async () => {
      renderPage();

      await screen.findByTestId("ArticlesForm-title");

      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Changed but not saved" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });
  });
});
