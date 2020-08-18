(function() {
    Vue.component("first-component", {
        template: "#template",
        props: ["compTitle", "id"],
        mounted: function() {
            var self = this;

            axios
                .get("/imagebyid/" + this.id)
                .then(function(results) {
                    self.title = results.data.title;
                    self.description = results.data.description;
                    self.url = results.data.url;
                    self.username = results.data.username;
                    self.created_at = results.data.created_at;
                })
                .catch(function(err) {
                    console.log("catch in image by id", err);
                });

            axios
                .get("/commentsbyid/" + this.id)
                .then(function(results) {
                    self.comments = results.data;
                })
                .catch(function(err) {
                    console.log("catch in comments by id", err);
                });
        }, //end of component mounted

        data: function() {
            return {
                title: "",
                description: "",
                url: "",
                comments: [],
                comment: "",
                commenter: "",
                created_at: "",
                username: "",
            };
        }, //end of component data

        methods: {
            closeModal: function() {
                this.$emit("closemodal");
            },

            handleHover: function() {
                this.$emit("handleHover");
            },

            handleCommentSubmit: function(e) {
                e.preventDefault();

                var self = this;

                var newComment = {
                    comment: this.comment,
                    commenter: this.commenter,
                    image_id: this.id,
                };

                axios
                    .post("/new-comment", newComment)
                    .then(function(response) {
                        self.comments.unshift(response.data);
                    })
                    .catch(function(err) {
                        console.log("error in new comment upload");
                    });
            },
        }, //end of component methods
    }); //component ends

    new Vue({
        el: "#main",

        data: {
            selectedImage: null,
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            moreImages: true,
        }, //end of data

        mounted: function() {
            var self = this;

            axios.get("/images").then(function(response) {
                self.images = response.data;
            });
        }, //mounted ends

        methods: {
            handleHover: function() {
                document
                    .getElementsByClassName("class-modal")
                    .classList.add("vis");
                console.log("hover");
            },

            handleImageClick: function(id) {
                this.selectedImage = id;
            },

            closeModal: function() {
                this.selectedImage = null;
            },

            handleClick: function(e) {
                e.preventDefault();

                var self = this;

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function(response) {
                        self.images.unshift(response.data[0]);
                        self.title = "";
                        self.description = "";
                        self.username = "";
                    })
                    .catch(function(err) {
                        console.log("error in post upload");
                    });
            },

            handleChange: function(e) {
                this.file = e.target.files[0];
            },

            handleMoreImages: function() {
                var self = this;
                let lastImage = self.images.length - 1;

                let lastId = self.images[lastImage].id;

                axios
                    .get("/moreimages/" + lastId)
                    .then(function(response) {
                        console.log(
                            "response data from /moreimages",
                            response.data
                        );
                        var lowestId =
                            response.data[response.data.length - 1].lowestId;

                        var lastId = response.data[response.data.length - 1].id;

                        if (lastId === lowestId) {
                            self.moreImages = false;
                        }
                        self.images = self.images.concat(response.data);
                    })
                    .catch((err) => {
                        console.log("error in handleMoreimages", err);
                    });
            },
        }, //methods ends

        //=================
    }); //end of vue

    //================
})(); //end of iife
