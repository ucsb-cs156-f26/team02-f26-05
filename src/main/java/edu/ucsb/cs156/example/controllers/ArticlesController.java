package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
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

/** This is a REST controller for Articles */
@Tag(name = "Articles")
@RequestMapping("/api/articles")
@RestController
@Slf4j
public class ArticlesController extends ApiController {

  @Autowired ArticlesRepository articlesRepository;

  /**
   * List all articles
   *
   * @return an iterable of Articles
   */
  @Operation(summary = "List all articles")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<Articles> allArticles() {
    Iterable<Articles> articles = articlesRepository.findAll();
    return articles;
  }

  /**
   * Get a single article by id
   *
   * @param id the id of the article
   * @return an Articles
   */
  @Operation(summary = "Get a single article")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public Articles getById(
      @Parameter(name = "id", description = "id of the article", example = "1") @RequestParam
          Long id) {
    Articles article =
        articlesRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));

    return article;
  }

  /**
   * Create a new article
   *
   * @param title the title of the article
   * @param url the url of the article
   * @param explanation why the article is useful
   * @param email the email of the person that submitted the article
   * @param dateAdded the date and time the article was added
   * @return the saved Articles
   */
  @Operation(summary = "Create a new article")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public Articles postArticles(
      @Parameter(
              name = "title",
              description = "title of the article",
              example = "Using testing-playground with React Testing Library")
          @RequestParam
          String title,
      @Parameter(
              name = "url",
              description = "url of the article",
              example =
                  "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7")
          @RequestParam
          String url,
      @Parameter(
              name = "explanation",
              description = "why the article is useful",
              example = "Helpful when we get to front end development")
          @RequestParam
          String explanation,
      @Parameter(
              name = "email",
              description = "email of the person who submitted the article",
              example = "phtcon@ucsb.edu")
          @RequestParam
          String email,
      @Parameter(
              name = "dateAdded",
              description =
                  "date and time the article was added (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)",
              example = "2022-04-20T00:00:00")
          @RequestParam("dateAdded")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateAdded) {

    Articles article = new Articles();
    article.setTitle(title);
    article.setUrl(url);
    article.setExplanation(explanation);
    article.setEmail(email);
    article.setDateAdded(dateAdded);

    Articles savedArticle = articlesRepository.save(article);

    return savedArticle;
  }

  /**
   * Update a single article
   *
   * @param id id of the article to update
   * @param incoming the new article
   * @return the updated article object
   */
  @Operation(summary = "Update a single article")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public Articles updateArticles(
      @Parameter(name = "id", description = "id of the article to update", example = "1")
          @RequestParam
          Long id,
      @RequestBody @Valid Articles incoming) {

    Articles article =
        articlesRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));

    article.setTitle(incoming.getTitle());
    article.setUrl(incoming.getUrl());
    article.setExplanation(incoming.getExplanation());
    article.setEmail(incoming.getEmail());
    article.setDateAdded(incoming.getDateAdded());

    articlesRepository.save(article);

    return article;
  }

  /**
   * Delete an article
   *
   * @param id the id of the article to delete
   * @return a message indicating the article was deleted
   */
  @Operation(
      summary = "Delete an article",
      description = "Deletes the article with the given id; 404 if the id does not exist")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteArticles(
      @Parameter(name = "id", description = "id of the article to delete", example = "1")
          @RequestParam
          Long id) {
    Articles article =
        articlesRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));

    articlesRepository.delete(article);
    return genericMessage("Articles with id %s deleted".formatted(id));
  }
}
