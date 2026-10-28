const menuItemReviewFixtures = {
    oneReview: {
      id: 1,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-20T12:00:00",
      comments: "bland af but edible I guess",
    },
    threeReviews: [
        {
        id: 1,
        itemId: 27,
        reviewerEmail: "cgaucho@ucsb.edu",
        stars: 3,
        dateReviewed: "2022-04-20T12:00:00",
        comments: "bland af but edible I guess",
        }, 
        {
            id: 2,
            itemId: 11,
            reviewerEmail: "jakob@ucsb.edu",
            stars: 5,
            dateReviewed: "2023-05-24T12:00:00",
            comments: "lit",
        },
        {
            id: 3,
            itemId: 19,
            reviewerEmail: "PQC@ucsb.edu",
            stars: 4,
            dateReviewed: "2026-10-05T12:00:00",
            comments: "tragically mogged",
        },
    ],
  };
  
  export { menuItemReviewFixtures };