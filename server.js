var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var EXPENSE_COLLECTION = "expenses";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// EXPENSE API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/expenses"
 *    GET: finds all expenses
 *    POST: creates a new expense
 */

app.get("/expenses", function(req, res) {
  db.collection(EXPENSE_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get expenses.");
    } else {
      res.status(200).json(docs);  
    }
  });
});

app.post("/expenses", function(req, res) {
  var newExpense = req.body;
  newExpense.createDate = new Date();

  if (!(req.body.name && req.body.amount)) {
    handleError(res, "Invalid user input", "Must provide a name and amount .", 400);
  }

  db.collection(EXPENSE_COLLECTION).insertOne(newExpense, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new expense.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/expenses/:id"
 *    GET: find expense by id
 *    PUT: update expense by id
 *    DELETE: deletes expense by id
 */

app.get("/expenses/:id", function(req, res) {
  db.collection(EXPENSE_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get expense");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/expenses/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(EXPENSE_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update expense");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/expenses/:id", function(req, res) {
  db.collection(EXPENSE_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete expense");
    } else {
      res.status(204).end();
    }
  });
});