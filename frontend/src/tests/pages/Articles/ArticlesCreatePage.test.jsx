import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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

  const renderPage = (props = {}) => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillInForm = () => {
    fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
      target: { value: "Handy Spring Utility Classes" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
      target: { value: "https://example.com/spring" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
      target: { value: "A lot of really useful classes are built into Spring" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
      target: { value: "phtcon@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
      target: { value: "2022-04-19T00:00" },
    });
  };

  const article = {
    id: 17,
    title: "Handy Spring Utility Classes",
    url: "https://example.com/spring",
    explanation: "A lot of really useful classes are built into Spring",
    email: "phtcon@ucsb.edu",
    dateAdded: "2022-04-19T00:00",
  };

  test("renders without crashing", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    axiosMock.onPost("/api/articles/post").reply(202, article);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fillInForm();

    const submitButton = screen.getByTestId("ArticlesForm-submit");
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Handy Spring Utility Classes",
      url: "https://example.com/spring",
      explanation: "A lot of really useful classes are built into Spring",
      email: "phtcon@ucsb.edu",
      dateAdded: "2022-04-19T00:00",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 17 title: Handy Spring Utility Classes",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("does not navigate away after a successful submit in storybook mode", async () => {
    axiosMock.onPost("/api/articles/post").reply(202, article);

    renderPage({ storybook: true });

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fillInForm();
    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("invalid data shows errors and is not sent to the backend", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("ArticlesForm-submit"));

    await screen.findByText(/Title is required./);
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
