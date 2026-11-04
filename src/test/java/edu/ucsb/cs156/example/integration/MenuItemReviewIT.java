package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
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
public class MenuItemReviewIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_menuitemreview() throws Exception {
    // arrange
    assertEquals(0L, menuItemReviewRepository.count());

    MenuItemReview expected =
        MenuItemReview.builder()
            .id(1L)
            .itemId(27L)
            .reviewerEmail("cgaucho@ucsb.edu")
            .stars(3)
            .dateReviewed(LocalDateTime.parse("2022-04-20T12:00:00"))
            .comments("bland but edible")
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/menuitemreviews/post")
                    .param("itemId", "27")
                    .param("reviewerEmail", "cgaucho@ucsb.edu")
                    .param("stars", "3")
                    .param("dateReviewed", "2022-04-20T12:00:00")
                    .param("comments", "bland but edible")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert: the response matches what we sent
    String expectedJson = mapper.writeValueAsString(expected);
    assertEquals(expectedJson, response.getResponse().getContentAsString());

    // assert: the record is really in the database
    assertEquals(1L, menuItemReviewRepository.count());
    MenuItemReview saved = menuItemReviewRepository.findById(1L).get();
    assertEquals(expected, saved);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_menuitemreview() throws Exception {
    // arrange
    MenuItemReview review =
        MenuItemReview.builder()
            .itemId(29L)
            .reviewerEmail("ldelplaya@ucsb.edu")
            .stars(5)
            .dateReviewed(LocalDateTime.parse("2022-04-21T18:30:00"))
            .comments("best veggie pizza ever")
            .build();
    menuItemReviewRepository.save(review);
    assertEquals(1L, menuItemReviewRepository.count());

    // act
    mockMvc.perform(delete("/api/menuitemreviews?id=1").with(csrf())).andExpect(status().isOk());

    // assert: the record is gone from the database
    assertEquals(0L, menuItemReviewRepository.count());
  }
}
