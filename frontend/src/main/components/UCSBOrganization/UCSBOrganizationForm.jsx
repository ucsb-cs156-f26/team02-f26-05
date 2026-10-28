import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "UCSBOrganizationForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents ? (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="orgCode">Org Code</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-orgCode"}
            id="orgCode"
            type="text"
            {...register("orgCode")}
            value={initialContents.orgCode}
            disabled
          />
        </Form.Group>
      ) : (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="orgCode">Org Code</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-orgCode"}
            id="orgCode"
            type="text"
            isInvalid={Boolean(errors.orgCode)}
            {...register("orgCode", {
              required: "Org Code is required.",
              maxLength: {
                value: 10,
                message: "Org Code max length 10 characters",
              },
            })}
          />
          <Form.Control.Feedback type="invalid">
            {errors.orgCode?.message}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslationShort">Short Name</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslationShort"}
          id="orgTranslationShort"
          type="text"
          isInvalid={Boolean(errors.orgTranslationShort)}
          {...register("orgTranslationShort", {
            required: "Short Name is required.",
            maxLength: {
              value: 30,
              message: "Short Name max length 30 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslationShort?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslation">Full Name</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslation"}
          id="orgTranslation"
          type="text"
          isInvalid={Boolean(errors.orgTranslation)}
          {...register("orgTranslation", {
            required: "Full Name is required.",
            maxLength: {
              value: 100,
              message: "Full Name max length 100 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          data-testid={testIdPrefix + "-inactive"}
          id="inactive"
          type="checkbox"
          label="Inactive"
          {...register("inactive")}
        />
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBOrganizationForm;