package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for RecommendationRequests */
@Tag(name = "RecommendationRequests")
@RequestMapping("/api/recommendationrequests")
@RestController
@Slf4j
public class RecommendationRequestController extends ApiController {

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  /**
   * List all recommendation requests
   *
   * @return an iterable of RecommendationRequest
   */
  @Operation(summary = "List all recommendation requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<RecommendationRequest> allRecommendationRequests() {
    Iterable<RecommendationRequest> requests = recommendationRequestRepository.findAll();
    return requests;
  }

  /**
   * Get a single recommendation request by id
   *
   * @param id the id of the recommendation request
   * @return a RecommendationRequest
   */
  @Operation(summary = "Get a single recommendation request by id")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public RecommendationRequest getById(
      @Parameter(name = "id", description = "id of the recommendation request, e.g. 1")
          @RequestParam
          Long id) {
    RecommendationRequest recommendationRequest =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    return recommendationRequest;
  }

  /**
   * Create a new recommendation request
   *
   * @param requesterEmail email of the student requesting the recommendation
   * @param professorEmail email of the professor being asked
   * @param explanation what the recommendation is for
   * @param dateRequested date the request was made
   * @param dateNeeded date the recommendation is needed by
   * @param done whether the request has been completed
   * @return the saved RecommendationRequest
   */
  @Operation(summary = "Create a new recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public RecommendationRequest postRecommendationRequest(
      @Parameter(
              name = "requesterEmail",
              description = "email of the requester, e.g. cgaucho@ucsb.edu")
          @RequestParam
          String requesterEmail,
      @Parameter(
              name = "professorEmail",
              description = "email of the professor, e.g. phtcon@ucsb.edu")
          @RequestParam
          String professorEmail,
      @Parameter(
              name = "explanation",
              description = "what the recommendation is for, e.g. BS/MS program")
          @RequestParam
          String explanation,
      @Parameter(
              name = "dateRequested",
              description = "date requested (ISO format, e.g. 2022-04-20T00:00:00)")
          @RequestParam("dateRequested")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateRequested,
      @Parameter(
              name = "dateNeeded",
              description = "date needed by (ISO format, e.g. 2022-05-01T00:00:00)")
          @RequestParam("dateNeeded")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateNeeded,
      @Parameter(name = "done", description = "true if the request is completed, false otherwise")
          @RequestParam
          boolean done)
      throws JsonProcessingException {

    log.info("dateRequested={}, dateNeeded={}", dateRequested, dateNeeded);

    RecommendationRequest recommendationRequest = new RecommendationRequest();
    recommendationRequest.setRequesterEmail(requesterEmail);
    recommendationRequest.setProfessorEmail(professorEmail);
    recommendationRequest.setExplanation(explanation);
    recommendationRequest.setDateRequested(dateRequested);
    recommendationRequest.setDateNeeded(dateNeeded);
    recommendationRequest.setDone(done);

    RecommendationRequest savedRequest =
        recommendationRequestRepository.save(recommendationRequest);

    return savedRequest;
  }

  /**
   * Update a single recommendation request
   *
   * @param id id of the recommendation request to update
   * @param incoming the new recommendation request values
   * @return the updated recommendation request object
   */
  @Operation(summary = "Update a single recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public RecommendationRequest updateRecommendationRequest(
      @Parameter(name = "id", description = "id of the recommendation request to update, e.g. 1")
          @RequestParam
          Long id,
      @RequestBody @Valid RecommendationRequest incoming) {

    RecommendationRequest recommendationRequest =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    recommendationRequest.setRequesterEmail(incoming.getRequesterEmail());
    recommendationRequest.setProfessorEmail(incoming.getProfessorEmail());
    recommendationRequest.setExplanation(incoming.getExplanation());
    recommendationRequest.setDateRequested(incoming.getDateRequested());
    recommendationRequest.setDateNeeded(incoming.getDateNeeded());
    recommendationRequest.setDone(incoming.getDone());

    recommendationRequestRepository.save(recommendationRequest);

    return recommendationRequest;
  }

  /**
   * Delete a single recommendation request
   *
   * @param id the id of the recommendation request to delete
   * @return a message indicating the recommendation request was deleted
   */
  @Operation(summary = "Delete a single recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteRecommendationRequest(
      @Parameter(name = "id", description = "id of the recommendation request to delete, e.g. 1")
          @RequestParam
          Long id) {
    RecommendationRequest recommendationRequest =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    recommendationRequestRepository.delete(recommendationRequest);
    return genericMessage("RecommendationRequest with id %s deleted".formatted(id));
  }
}
