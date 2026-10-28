import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Date Added (iso format)",
    "Title",
    "URL",
    "Explanation",
    "Email",
  ];
  const testId = "ArticlesForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  const fillGoodInput = () => {
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "Handy Spring Utility Classes" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://example.com/article" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Useful classes built into Spring" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2022-04-19T12:00" },
    });
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: articlesFixtures.oneArticle,
      buttonLabel: "Update",
    });

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );
    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle.explanation,
    );
    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle.email,
    );
    // datetime-local inputs drop seconds of :00, so "2022-04-20T00:00:00" displays as below
    expect(screen.getByTestId(`${testId}-dateAdded`)).toHaveValue(
      "2022-04-20T00:00",
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    renderForm();
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct error messages on missing input", async () => {
    renderForm();

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Create/));

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("Correct error messages on bad url and email", async () => {
    renderForm();

    expect(await screen.findByTestId(`${testId}-url`)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "not-a-url" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/URL must start with http:\/\/ or https:\/\//);
    expect(
      screen.getByText(/Email must be a valid email address/),
    ).toBeInTheDocument();
  });

  test("Correct error messages on input that is too long", async () => {
    renderForm();

    expect(await screen.findByTestId(`${testId}-title`)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://" + "a".repeat(248) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "a".repeat(247) + "@ucsb.edu" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 255 characters/)).toHaveLength(4);
    });
  });

  test("No error messages on good input, including 255-character values", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    expect(await screen.findByTestId(`${testId}-title`)).toBeInTheDocument();
    fillGoodInput();
    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/URL must start with http/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Email must be a valid email address/),
    ).not.toBeInTheDocument();
  });
});
