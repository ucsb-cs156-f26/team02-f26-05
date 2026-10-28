const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "s22-5pm-3",
    tableOrBreakoutRoom: "7",
    requestTime: "2022-01-03T00:00:00",
    explanation: "Need help with Swagger-ui",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2022-01-03T00:00:00",
      explanation: "Need help with Swagger-ui",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "s22-6pm-4",
      tableOrBreakoutRoom: "11",
      requestTime: "2022-03-11T00:00:00",
      explanation: "Dokku problems",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "pdg@ucsb.edu",
      teamId: "s22-7pm-2",
      tableOrBreakoutRoom: "13",
      requestTime: "2022-04-20T14:30:00",
      explanation: "Merge conflict on main branch",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
