const DatabaseHandler = require("../dist/utils/DatabaseHandler");
let dbh;

describe("Server", function () {
  describe("DatabaseHandler", function () {
    before(function () {
      dbh = new DatabaseHandler.default((log = false));
    });

    after(function () {
      dbh.disconnect();
    });

    describe("#getUser()", function (done) {
      it("should give back an user", (done) => {
        dbh
          .getUser("t@eszter.hu")
          .then((user) => {
            if (user instanceof DatabaseHandler.DatabaseError) {
              done(user);
            } else {
              done();
            }
          })
          .catch((error) => {
            done(error);
          });
      });

      it("should not give back an user", (done) => {
        dbh
          .getUser("wrong@eszter.hu")
          .then((user) => {
            if (user instanceof DatabaseHandler.DatabaseError) {
              done();
            } else {
              done(new Error("The user exists"));
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    describe("#createNewPair()", function () {
      it("should not create a pair", (done) => {
        dbh
          .createNewPair("t@eszter.hu")
          .then((pair) => {
            if (pair instanceof DatabaseHandler.DatabaseError) {
              done();
            } else {
              done(new Error(pair.message));
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    describe("#joinToPair()", function () {
      it("should not join to a pair", (done) => {
        dbh
          .joinToPair("jozsika88@citromail.hu", "admin", "TEST_PAIR")
          .then((pair) => {
            if (pair instanceof DatabaseHandler.DatabaseError) {
              done();
            } else {
              done(new Error("This pair should be locked"));
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    describe("#deletePair()", function () {
      it("should not delete a pair", (done) => {
        dbh
          .deletePair("jozsika88@citromail.hu", "admin")
          .then((pair) => {
            if (pair instanceof DatabaseHandler.DatabaseError) {
              done();
            } else {
              done();
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });

    describe("#deleteList()", function () {
      it("should delete a list", (done) => {
        dbh
          .deleteList("t@eszter.hu", "admin", 1)
          .then((list) => {
            if (list instanceof DatabaseHandler.DatabaseError) {
              done(new Error("This list should be deleted"));
            } else {
              done();
            }
          })
          .catch((error) => {
            done(error);
          });
      });
    });
  });
});
