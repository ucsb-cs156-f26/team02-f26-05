import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Request Time (iso format)",
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  const fillGoodInput = () => {
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "s22-5pm-3" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with Swagger-ui" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2022-01-03T12:00" },
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
    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents: helpRequestFixtures.oneHelpRequest,
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
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.requesterEmail,
    );
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.teamId,
    );
    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.tableOrBreakoutRoom,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      helpRequestFixtures.oneHelpRequest.explanation,
    );
    // datetime-local inputs drop seconds of :00, so "2022-01-03T00:00:00" displays as below
    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue(
      "2022-01-03T00:00",
    );
    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
  });

  test("solved checkbox is checked when initialContents has solved true", async () => {
    renderForm({
      initialContents: helpRequestFixtures.threeHelpRequests[1],
      buttonLabel: "Update",
    });

    expect(await screen.findByTestId(`${testId}-solved`)).toBeChecked();
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

    await screen.findByText(/Requester Email is required./);
    expect(screen.getByText(/Team Id is required./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required./)).toBeInTheDocument();
  });

  test("Correct error message on bad email", async () => {
    renderForm();

    expect(
      await screen.findByTestId(`${testId}-requesterEmail`),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Requester Email must be a valid email address/);
  });

  test("Correct error messages on input that is too long", async () => {
    renderForm();

    expect(await screen.findByTestId(`${testId}-teamId`)).toBeInTheDocument();
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "a".repeat(247) + "@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 255 characters/)).toHaveLength(4);
    });
  });

  test("No error messages on good input, including 255-character values", async () => {
    const mockSubmitAction = vi.fn();
    renderForm({ submitAction: mockSubmitAction });

    expect(await screen.findByTestId(`${testId}-teamId`)).toBeInTheDocument();
    fillGoodInput();
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-solved`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(mockSubmitAction.mock.calls[0][0]).toMatchObject({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      explanation: "a".repeat(255),
      requestTime: "2022-01-03T12:00",
      solved: true,
    });

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Requester Email must be a valid email address/),
    ).not.toBeInTheDocument();
  });
});
