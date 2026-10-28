import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const expectedHeaders = ["Org Code", "Short Name", "Full Name", "Inactive"];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-orgCode`)).not.toBeDisabled();
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.threeOrganizations[2]}
          buttonLabel="Update"
        />
      </Router>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    const orgCodeField = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeField).toBeDisabled();
    expect(orgCodeField).toHaveValue("KRC");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "KOREAN RADIO CL",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "KOREAN RADIO CLUB",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).toBeChecked();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("shows required errors on missing input", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    await screen.findByText(/Org Code is required./);
    expect(screen.getByText(/Short Name is required./)).toBeInTheDocument();
    expect(screen.getByText(/Full Name is required./)).toBeInTheDocument();
  });

  test("shows max length errors on input that is too long", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-orgCode`), {
      target: { value: "a".repeat(11) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "a".repeat(31) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "a".repeat(101) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Org Code max length 10 characters/);
    expect(
      screen.getByText(/Short Name max length 30 characters/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Full Name max length 100 characters/),
    ).toBeInTheDocument();
  });

  test("calls submitAction with the form data on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-orgCode`), {
      target: { value: "SKY" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "SKYDIVING CLUB" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "SKYDIVING CLUB AT UCSB" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: true,
    });
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/max length/)).not.toBeInTheDocument();
  });
});