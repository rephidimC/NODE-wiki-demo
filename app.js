const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();
const path = require("path");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});


const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A must to have a name"]
  },
  content: {
    type: String,
    required: [true, "A must to have a body"]
  }
});

const Article = mongoose.model("Article", articleSchema);
//mongoose will automatically make the "Article" become "articles"


app.route("/articles")
  // app.route(/dir).get.post.delete;
  .get(function(req, res) {
    Article.find(function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {
    const newArticle = new Article ({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function(err) {
      if (!err) {
        res.send("done");
      } else {
        res.send(err);
      }
    });
    // console.log(req.body.title);
    // console.log(req.body.content);
    //the above are chosen arbitrarily,assumption that naturally we wouldhave a title and a content for the user to fill into maybe a form.
  })

  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Successfully deleted all");
      } else {
        res.send(err);
      }
    });
  })
;



app.route("/articles/:articleTitle")
  // app.route(/dir).get.post.delete;
  .get(function(req, res) {
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      //we use find One because we want one document with title same as requuested by client when they type in the link input field
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send(err);
      }
    });
  })

  .put(function(req, res) {
    //put replaces a whole document in the database
    Article.update(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      {overwrite: true},
      function(err) {
        if (!err) {
            res.send("Successfully updated");
          } else {
            res.send(err);
          }
      }
    );
  })

  .patch(function(req, res) {
    //put replaces a whole document in the database
    Article.updateOne(
      {title: req.params.articleTitle},
      // {$set: {content: req.body.content}},
      //but the above limits the patch to request to only update the content at all times.
      //what if the fellow wants to update the title?
      //hence, we do this below.
      {$set: req.body},
      //why req. body alone? because by the time the field is field, body parser returns it as a javascript object with title and content.
      //hence, if one is empty, all good. it patches that way.
      {overwrite: true},
      function(err) {
        if (!err) {
            res.send("Successfully updated");
          } else {
            res.send(err);
          }
      }
    );
    // console.log(req.body.title);
    // console.log(req.body.content);
    //the above are chosen arbitrarily,assumption that naturally we wouldhave a title and a content for the user to fill into maybe a form.
  })

  .delete(function(req, res) {
    //put replaces a whole document in the database
    Article.deleteOne(
      {title: req.params.articleTitle},
      function(err) {
        if (!err) {
            res.send("Successfully deleted");
          } else {
            res.send(err);
          }
      }
    );
    // console.log(req.body.title);
    // console.log(req.body.content);
    //the above are chosen arbitrarily,assumption that naturally we wouldhave a title and a content for the user to fill into maybe a form.
  })
;


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
