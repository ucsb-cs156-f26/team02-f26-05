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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_menu_item() throws Exception {
    setupUser(true);

    page.getByText("Dining Commons Menu Items", new Page.GetByTextOptions().setExact(true)).click();

    page.getByText("Create Menu Item").click();
    assertThat(page.getByText("Create New Dining Commons Menu Item")).isVisible();
    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("ortega");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("Baked Pesto Pasta");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Entree Specials");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-diningCommonsCode"))
        .hasText("ortega");
    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-name"))
        .hasText("Baked Pesto Pasta");
    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable-cell-row-0-col-station"))
        .hasText("Entree Specials");
  }
}
