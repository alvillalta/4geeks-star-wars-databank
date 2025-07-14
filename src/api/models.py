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
                "following": [row.serialize()["following_id"] for row in self.follower_to]}
    

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
    image_url = db.Column(db.String(), nullable=False)
    

class Medias(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    media_type = db.Column(db.Enum("image", "video", "audio", name="media_type", create_type=False), nullable=False)
    url = db.Column(db.String(2000), nullable=False)
    

class Comments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(2200))
    

class CharacterFavorites(db.Model):
    id = db.Column(db.Integer, primary_key=True)


class Characters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    height = db.Column(db.Float, nullable=False)
    mass = db.Column(db.Integer, nullable=False)
    hair_color = db.Column(db.String(200))
    skin_color = db.Column(db.String(200))
    eye_color = db.Column(db.String(200))
    birth_year = db.Column(db.Date(), nullable=False)
    gender = db.Column(db.Enum("none", "male", "female", "other", name="gender"), nullable=False)


class PlanetFavorites(db.Model):
    id = db.Column(db.Integer, primary_key=True)


class Planets(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    diameter = db.Column(db.Integer, nullable=False)
    rotation_period = db.Column(db.Integer, nullable=False)
    orbital_period = db.Column(db.Integer, nullable=False)
    gravity = db.Column(db.Integer, nullable=False)
    population = db.Column(db.Integer)
    climate = db.Column(db.String(200), nullable=False)
    terrain = db.Column(db.String(200), nullable=False)