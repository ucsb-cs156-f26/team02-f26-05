import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

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
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
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
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit HelpRequest");
      expect(
        screen.queryByTestId("HelpRequestForm-requesterEmail"),
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
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s22-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2022-01-03T12:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: "17",
        requesterEmail: "ldelplaya@ucsb.edu",
        teamId: "s22-6pm-4",
        tableOrBreakoutRoom: "11",
        requestTime: "2022-03-11T08:00",
        explanation: "Dokku problems",
        solved: true,
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
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("HelpRequestForm-requesterEmail");
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("17");
      expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
        "cgaucho@ucsb.edu",
      );
      expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue(
        "s22-5pm-3",
      );
      expect(
        screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      ).toHaveValue("7");
      expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue(
        "2022-01-03T12:00",
      );
      expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
        "Need help with Swagger-ui",
      );
      expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
      expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
        "Update",
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
        target: { value: "s22-6pm-4" },
      });
      fireEvent.change(
        screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
        { target: { value: "11" } },
      );
      fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
        target: { value: "2022-03-11T08:00" },
      });
      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "Dokku problems" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-solved"));

      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 17 requesterEmail: ldelplaya@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "ldelplaya@ucsb.edu",
          teamId: "s22-6pm-4",
          tableOrBreakoutRoom: "11",
          requestTime: "2022-03-11T08:00",
          explanation: "Dokku problems",
          solved: true,
        }),
      ); // posted object
    });

    test("Does not save when data is invalid", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
        target: { value: "not-an-email" },
      });
      fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await screen.findByText(/Requester Email must be a valid email address/);
      expect(screen.getByText(/Team Id is required./)).toBeInTheDocument();

      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Does not save and goes back when you click Cancel", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "Changed but not saved" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toHaveBeenCalled();
    });
  });
});
