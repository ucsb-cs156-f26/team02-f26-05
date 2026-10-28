import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  const testId = "RecommendationRequestForm";

  const expectedHeaders = [
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested (iso format)",
    "Date Needed (iso format)",
    "Done",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <RecommendationRequestForm
          initialContents={
            recommendationRequestFixtures.oneRecommendationRequest
          }
        />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();

    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      "cgaucho@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-professorEmail`)).toHaveValue(
      "phtcon@ucsb.edu",
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      "BS/MS program",
    );
    expect(screen.getByTestId(`${testId}-done`)).not.toBeChecked();
  });

  test("uses the buttonLabel prop", async () => {
    render(
      <Router>
        <RecommendationRequestForm buttonLabel="Update" />
      </Router>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required./);
    expect(
      screen.getByText(/Professor Email is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Requested is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Needed is required./)).toBeInTheDocument();
  });

  test("Correct Error messages on bad input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    const requesterEmailField = await screen.findByTestId(
      `${testId}-requesterEmail`,
    );
    const professorEmailField = screen.getByTestId(`${testId}-professorEmail`);
    const explanationField = screen.getByTestId(`${testId}-explanation`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(requesterEmailField, {
      target: { value: "not-an-email" },
    });
    fireEvent.change(professorEmailField, { target: { value: "bad@email" } });
    fireEvent.change(explanationField, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email must be a valid email address./);
    expect(
      screen.getByText(/Professor Email must be a valid email address./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    const requesterEmailField = await screen.findByTestId(
      `${testId}-requesterEmail`,
    );
    const professorEmailField = screen.getByTestId(`${testId}-professorEmail`);
    const explanationField = screen.getByTestId(`${testId}-explanation`);
    const dateRequestedField = screen.getByTestId(`${testId}-dateRequested`);
    const dateNeededField = screen.getByTestId(`${testId}-dateNeeded`);
    const doneField = screen.getByTestId(`${testId}-done`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(requesterEmailField, {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "phtcon@ucsb.edu" },
    });
    fireEvent.change(explanationField, { target: { value: "a".repeat(255) } });
    fireEvent.change(dateRequestedField, {
      target: { value: "2022-04-20T00:00" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2022-05-01T00:00" },
    });
    fireEvent.click(doneField);
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction.mock.calls[0][0]).toMatchObject({
      requesterEmail: "cgaucho@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation: "a".repeat(255),
      dateRequested: "2022-04-20T00:00",
      dateNeeded: "2022-05-01T00:00",
      done: true,
    });

    expect(
      screen.queryByText(/must be a valid email address/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
