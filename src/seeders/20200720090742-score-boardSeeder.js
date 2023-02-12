const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('score_board', [
      {
        run: 2,
        batsman: "virat kohli",
        score: 2,
        wicket: 0,
        over: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        run: 4,
        batsman: "virat kohli",
        score: 6,
        wicket: 0,
        over: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        run: 6,
        batsman: "virat kohli",
        score: 12,
        wicket: 0,
        over: 1,
        createdAt: new Date("2023-02-11 15:11:22"),
        updatedAt: new Date("2023-02-11 15:11:22")
      },
      {
        run: 0,
        batsman: "virat kohli",
        score: 12,
        wicket: 1,
        over: 1,
        createdAt: new Date("2023-02-11 15:11:22"),
        updatedAt: new Date("2023-02-11 15:11:22")
      },
      {
        run: 6,
        batsman: "hardik pandey",
        score: 18,
        wicket: 1,
        over: 1,
        createdAt: new Date("2023-02-11 15:11:22"),
        updatedAt: new Date("2023-02-11 15:11:22")
      },
      {
        run: 6,
        batsman: "hardik pandey",
        score: 24,
        wicket: 1,
        over: 1,
        createdAt: new Date("2023-02-10 15:11:22"),
        updatedAt: new Date("2023-02-10 15:11:22")
      },
      {
        run: 3,
        batsman: "hardik pandey",
        score: 27,
        wicket: 1,
        over: 2,
        createdAt: new Date("2023-02-09 15:11:22"),
        updatedAt: new Date("2023-02-09 15:11:22")
      },
      {
        run: 0,
        batsman: "hardik pandey",
        score: 27,
        wicket: 2,
        over: 2,
        createdAt: new Date("2023-02-09 15:11:22"),
        updatedAt: new Date("2023-02-09 15:11:22")
      },
      {
        run: 3,
        batsman: "dhoni",
        score: 30,
        wicket: 2,
        over: 2,
        createdAt: new Date("2023-02-08 15:11:22"),
        updatedAt: new Date("2023-02-08 15:11:22")
      },
      {
        run: 2,
        batsman: "dhoni",
        score: 29,
        wicket: 2,
        over: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        run: 4,
        batsman: "dhoni",
        score: 33,
        wicket: 2,
        over: 2,
        createdAt: new Date("2023-02-07 15:11:22"),
        updatedAt: new Date("2023-02-07 15:11:22")
      },
      {
        run: 1,
        batsman: "dhoni",
        score: 34,
        wicket: 2,
        over: 2,
        createdAt: new Date("2023-02-07 15:11:22"),
        updatedAt: new Date("2023-02-07 15:11:22")
      },
      {
        run: 6,
        batsman: "dhoni",
        score: 40,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-07 15:11:22"),
        updatedAt: new Date("2023-02-07 15:11:22")
      },
      {
        run: 3,
        batsman: "dhoni",
        score: 43,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-07 15:11:22"),
        updatedAt: new Date("2023-02-07 15:11:22")
      },
      {
        run: 6,
        batsman: "dhoni",
        score: 49,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-07 20:11:22"),
        updatedAt: new Date("2023-02-07 20:11:22")
      },
      {
        run: 1,
        batsman: "dhoni",
        score: 50,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-07 18:11:22"),
        updatedAt: new Date("2023-02-07 18:11:22")
      },
      {
        run: 4,
        batsman: "dhoni",
        score: 54,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-06 15:11:22"),
        updatedAt: new Date("2023-02-06 15:11:22")
      },
      {
        run: 6,
        batsman: "dhoni",
        score: 60,
        wicket: 2,
        over: 3,
        createdAt: new Date("2023-02-05 15:11:22"),
        updatedAt: new Date("2023-02-05 15:11:22")
      }
    ])
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('score_board', null, {});
  },
}
