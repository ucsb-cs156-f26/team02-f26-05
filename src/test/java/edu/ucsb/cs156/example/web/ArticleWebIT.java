package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_article() throws Exception {
    setupUser(true);

    page.getByText("Articles", new Page.GetByTextOptions().setExact(true)).click();

    page.getByText("Create Article").click();
    assertThat(page.getByText("Create New Article")).isVisible();
    page.getByTestId("ArticlesForm-dateAdded").fill("2022-04-20T00:00");
    page.getByTestId("ArticlesForm-title")
        .fill("Using testing-playground with React Testing Library");
    page.getByTestId("ArticlesForm-url")
        .fill("https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7");
    page.getByTestId("ArticlesForm-explanation")
        .fill("Helpful when we get to front end development");
    page.getByTestId("ArticlesForm-email").fill("phtcon@ucsb.edu");
    page.getByTestId("ArticlesForm-submit").click();

    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title"))
        .hasText("Using testing-playground with React Testing Library");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-email")).hasText("phtcon@ucsb.edu");
    assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-dateAdded"))
        .hasText("2022-04-20T00:00:00");
  }
}
