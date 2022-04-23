const express = require("express");
const app = express();
const db = require("./db.js");
const s3 = require("./s3");
const config = require("./config");

app.use(express.static("./public"));
app.use(express.json());

//==image upload boilerplate==//
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});
//==end of boilerplate==

app.get("/images", (req, res) => {
    console.log("step 2 get request made");
    db.getImages()
        .then((results) => {
            console.log("getImages");
            res.json(results.rows);
            console.log("step 4 results returned from db");
        })
        .catch((err) => {
            console.log("error in getImages:", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let username = req.body.username;
    let url = config.s3Url + req.file.filename;

    if (req.file) {
        db.saveImage(title, description, username, url)
            .then((results) => {
                res.json(results.rows);
            })
            .catch((err) => {
                console.log("index.js error in saveImage", err);
            });
    } else {
        console.log("error in post upload");
    }
});

app.get("/imagebyid/:id", (req, res) => {
    db.getImageById(req.params.id)
        .then((results) => {
            res.json(results.rows[0]);
        })
        .catch((err) => {
            console.log("index.js error in image by id", err);
        });
});

app.get("/commentsbyid/:id", (req, res) => {
    db.getCommentsById(req.params.id)
        .then((results) => {
            res.json(results.rows);
        })
        .catch((err) => {
            console.log("index.js error in comment by id", err);
        });
});

app.post("/new-comment/", (req, res) => {
    let image_id = req.body.image_id;
    let comment = req.body.comment;
    let username = req.body.commenter;
    db.saveNewComment(comment, username, image_id)
        .then((results) => {
            res.json(results.rows[0]);
        })
        .catch((err) => {
            console.log("index.js error in save new comment", err);
        });
});

app.get("/moreimages/:lastId", (req, res) => {
    db.getMoreImages(req.params.lastId)
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            console.log("index.js error in get more images", err);
        });
});

//========

app.listen(process.env.PORT || 8080, () =>
    console.log("imageboard server is running")
);
