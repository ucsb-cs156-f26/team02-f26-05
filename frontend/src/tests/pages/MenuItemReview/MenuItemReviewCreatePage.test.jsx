import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
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

describe("MenuItemReviewCreatePage tests", () => {
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

  const fillInForm = (values) => {
    Object.entries(values).forEach(([field, value]) => {
      fireEvent.change(screen.getByTestId(`MenuItemReviewForm-${field}`), {
        target: { value },
      });
    });
  };

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Create New MenuItemReview"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("MenuItemReviewForm-itemId")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const queryClient = new QueryClient();
    const review = {
      id: 17,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-04-20T12:00",
      comments: "pretty good",
    };

    axiosMock.onPost("/api/menuitemreviews/post").reply(202, review);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("MenuItemReviewForm-itemId");

    fillInForm({
      itemId: "27",
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: "4",
      dateReviewed: "2022-04-20T12:00",
      comments: "pretty good",
    });

    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "27",
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: "4",
      dateReviewed: "2022-04-20T12:00",
      comments: "pretty good",
    });

    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        "New menuItemReview Created - id: 17 itemId: 27",
      ),
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });

  test("does not redirect after success when storybook is true", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/menuitemreviews/post").reply(202, {
      id: 18,
      itemId: 5,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("MenuItemReviewForm-itemId");

    fillInForm({
      itemId: "5",
      reviewerEmail: "a@b.edu",
      stars: "1",
      dateReviewed: "2022-04-20T12:00",
      comments: "meh",
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        "New menuItemReview Created - id: 18 itemId: 5",
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New MenuItemReview")).toBeInTheDocument();
  });
});
