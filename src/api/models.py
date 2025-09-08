from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False, nullable=False)
    first_name = db.Column(db.String())
    last_name = db.Column(db.String())

    def __repr__(self):
        return f"<User {self.id} - {self.email}>"

    def serialize(self):
        return {"id": self.id,
                "email": self.email,
                "is_active": self.is_active,
                "is_admin": self.is_admin,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "followers": [row.serialize()["follower_id"] for row in self.following_to],
                "following": [row.serialize()["following_id"] for row in self.follower_to],
                "posts": [row.serialize()["id"] for row in self.user_posts],
                "comments": [row.serialize() for row in self.user_comments]}


class Followers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    following_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    following_to = db.relationship("Users", foreign_keys=[following_id],
                                   backref=db.backref("following_to", lazy="select"))
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    follower_to = db.relationship("Users", foreign_keys=[follower_id],
                                  backref=db.backref("follower_to", lazy="select"))

    def __repr__(self):
        return f"<Following: {self.following_id} - Followers: {self.follower_id}>"

    def serialize(self):
        return {"id": self.id,
                "following_id": self.following_id,
                "follower_id": self.follower_id}


class Posts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    description = db.Column(db.String(150))
    body = db.Column(db.String(2200))
    date = db.Column(db.Date(), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user_to = db.relationship("Users", foreign_keys=[user_id],
                              backref=db.backref("user_posts", lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "body": self.body,
            "date": self.date.strftime("%d-%m-%Y"),
            "medium_to_post": self.medium_to_post.url if self.medium_to_post else None,
            "comments": [row.serialize() for row in self.comments_to_post] if self.comments_to_post else None,
            "user_id": self.user_id}


class Media(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    medium_type = db.Column(db.Enum(
        "image", "video", "audio", name="medium_type", create_type=False), nullable=False)
    url = db.Column(db.String(2000), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), unique=True, nullable=False)
    post_to = db.relationship("Posts", foreign_keys=[post_id],
                              backref=db.backref("medium_to_post", uselist=False, lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "medium_type": self.medium_type,
            "url": self.url,
            "post_id": self.post_id}


class Comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(2200))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user_to = db.relationship("Users", foreign_keys=[user_id],
                              backref=db.backref("user_comments", lazy="select"))
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"))
    post_to = db.relationship("Posts", foreign_keys=[post_id],
                              backref=db.backref("comments_to_post", lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "body": self.body,
            "user_id": self.user_id,
            "post_id": self.post_id}
