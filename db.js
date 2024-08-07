const { MongoClient } = require("mongodb");
let dbConnection;
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect("mongodb://localhost:27017/jenkins")
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.error(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
