package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendationrequest() throws Exception {
    // arrange
    assertEquals(0, recommendationRequestRepository.count());

    RecommendationRequest expected =
        RecommendationRequest.builder()
            .id(1L)
            .requesterEmail("cgaucho@ucsb.edu")
            .professorEmail("phtcon@ucsb.edu")
            .explanation("BS/MS program")
            .dateRequested(LocalDateTime.parse("2022-04-20T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-05-01T00:00:00"))
            .done(true)
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/recommendationrequests/post")
                    .param("requesterEmail", "cgaucho@ucsb.edu")
                    .param("professorEmail", "phtcon@ucsb.edu")
                    .param("explanation", "BS/MS program")
                    .param("dateRequested", "2022-04-20T00:00:00")
                    .param("dateNeeded", "2022-05-01T00:00:00")
                    .param("done", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert - response
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    // assert - the row is really in the database
    assertEquals(1, recommendationRequestRepository.count());
    RecommendationRequest saved = recommendationRequestRepository.findById(1L).get();
    assertEquals(expected, saved);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_recommendationrequest() throws Exception {
    // arrange - put a real row in the database
    RecommendationRequest request =
        RecommendationRequest.builder()
            .requesterEmail("ldelplaya@ucsb.edu")
            .professorEmail("richert@ucsb.edu")
            .explanation("PhD CS Stanford")
            .dateRequested(LocalDateTime.parse("2022-05-20T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-11-15T00:00:00"))
            .done(false)
            .build();
    RecommendationRequest saved = recommendationRequestRepository.save(request);
    long id = saved.getId();
    assertEquals(1, recommendationRequestRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(
                delete("/api/recommendationrequests").param("id", String.valueOf(id)).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert - response message
    Map<String, Object> json =
        mapper.readValue(response.getResponse().getContentAsString(), Map.class);
    assertEquals("RecommendationRequest with id %d deleted".formatted(id), json.get("message"));

    // assert - the row is really gone from the database
    assertTrue(recommendationRequestRepository.findById(id).isEmpty());
    assertEquals(0, recommendationRequestRepository.count());
  }
}
