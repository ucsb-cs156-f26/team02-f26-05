import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { http, HttpResponse } from "msw";

import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";

export default {
  title: "pages/MenuItemReview/MenuItemReviewCreatePage",
  component: MenuItemReviewCreatePage,
};

const Template = () => <MenuItemReviewCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/menuitemreviews/post", () => {
      return HttpResponse.json(menuItemReviewFixtures.oneReview, {
        status: 200,
      });
    }),
  ],
};
