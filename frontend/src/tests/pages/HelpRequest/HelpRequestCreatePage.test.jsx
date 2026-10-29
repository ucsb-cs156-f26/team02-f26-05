import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders without crashing", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const helpRequest = {
      id: 17,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-01-03T12:00",
      explanation: "Need help with Swagger-ui",
      solved: true,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, helpRequest);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "s22-5pm-3" },
    });
    fireEvent.change(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      {
        target: { value: "7" },
      },
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2022-01-03T12:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Need help with Swagger-ui" },
    });
    fireEvent.click(screen.getByTestId("HelpRequestForm-solved"));

    const submitButton = screen.getByTestId("HelpRequestForm-submit");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-01-03T12:00",
      explanation: "Need help with Swagger-ui",
      solved: true,
    });

    expect(mockToast).toBeCalledWith(
      "New helpRequest Created - id: 17 requesterEmail: cgaucho@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/helprequest" });
  });

  test("when you submit invalid data, no request is made to the backend", async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId("HelpRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await screen.findByText(/Requester Email must be a valid email address/);
    expect(screen.getByText(/Team Id is required./)).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
