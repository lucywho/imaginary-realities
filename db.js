const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imagedb"
);

module.exports.getImages = () => {
    console.log("getImages");
    return db.query(`SELECT * FROM images ORDER BY id DESC LIMIT 8;`);
};

module.exports.saveImage = (title, description, username, url) => {
    return db.query(
        `INSERT INTO images (title, description, username, url) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [title, description, username, url]
    );
};

module.exports.getImageById = (id) => {
    return db.query(`SELECT * FROM images WHERE id=$1`, [id]);
};

module.exports.getCommentsById = (id) => {
    return db.query(
        `SELECT comments.username, comments.comment, comments.created_at 
        FROM comments LEFT JOIN images on comments.image_id = images.id WHERE image_id = $1
    `,
        [id]
    );
};

module.exports.saveNewComment = (comment, username, image_id) => {
    return db.query(
        `INSERT INTO comments (comment, username, image_id) VALUES ($1, $2, $3) RETURNING *`,
        [comment, username, image_id]
    );
};

module.exports.getMoreImages = (lastId) => {
    return db
        .query(
            `SELECT *, (
                SELECT id FROM images
                ORDER BY id ASC
                LIMIT 1
            ) AS "lowestId" FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 8;`,
            [lastId]
        )
        .then(({ rows }) => rows);
};
