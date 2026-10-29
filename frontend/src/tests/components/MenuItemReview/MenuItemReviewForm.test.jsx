import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const testId = "MenuItemReviewForm";

  const expectedHeaders = [
    "Item Id",
    "Reviewer Email",
    "Stars (0-5)",
    "Date Reviewed (iso format)",
    "Comments",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.oneReview}
        />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-itemId`)).toHaveValue(27);
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-stars`)).toHaveValue(3);
    expect(screen.getByTestId(`${testId}-comments`)).toHaveValue(
      "bland af but edible I guess",
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
  });

  test("uses the buttonLabel prop when supplied", async () => {
    render(
      <Router>
        <MenuItemReviewForm buttonLabel="Update" />
      </Router>,
    );
    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows the correct error messages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required./);
    expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/Comments are required./)).toBeInTheDocument();
  });

  test("shows the correct error messages on bad input (too small)", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId(`${testId}-itemId`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Item Id must be at least 1./);
    expect(
      screen.getByText(/Reviewer Email must be a valid email address./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Stars must be at least 0./)).toBeInTheDocument();
    expect(
      screen.getByText(/Comments must be at most 255 characters./),
    ).toBeInTheDocument();
  });

  test("shows the correct error message when stars is too large", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId(`${testId}-stars`);

    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(/Stars must be at most 5./),
    ).toBeInTheDocument();
  });

  test("no error messages and submitAction is called on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId(`${testId}-itemId`);

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2022-04-20T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be/)).not.toBeInTheDocument();
  });

  test("stars of 0 is accepted", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.threeReviews[2]}
          submitAction={mockSubmitAction}
        />
      </Router>,
    );
    await screen.findByTestId(`${testId}-stars`);
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2022-04-21T13:15" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/Stars must be/)).not.toBeInTheDocument();
  });
});
