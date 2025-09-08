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
                "comments": [row.serialize() for row in self.user_comments],
                "character_favorites": [row.character_to.serialize() for row in self.user_character_favorites],
                "planet_favorites": [row.planet_to.serialize() for row in self.user_planet_favorites],
                "starship_favorites": [row.starship_to.serialize() for row in self.user_starship_favorites]}


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


class CharacterFavorites(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user_to = db.relationship("Users", foreign_keys=[user_id],
                              backref=db.backref("user_character_favorites", lazy="select"))
    character_id = db.Column(db.Integer, db.ForeignKey("characters.id"))
    character_to = db.relationship("Characters", foreign_keys=[character_id],
                                   backref=db.backref("character_favorites", lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "character_id": self.character_id}


class Characters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    height = db.Column(db.Integer)
    mass = db.Column(db.Integer)
    hair_color = db.Column(db.String(200))
    skin_color = db.Column(db.String(200))
    eye_color = db.Column(db.String(200))
    birth_year = db.Column(db.String(200))
    gender = db.Column(db.String(200))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "height": self.height,
            "mass": self.mass,
            "hair_color": self.hair_color,
            "skin_color": self.skin_color,
            "eye_color": self.eye_color,
            "birth_year": self.birth_year,
            "gender": self.gender}
    
    def serialize_cards(self):
        return {
            "id": self.id,
            "name": self.name}


class PlanetFavorites(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user_to = db.relationship("Users", foreign_keys=[user_id],
                              backref=db.backref("user_planet_favorites", lazy="select"))
    planet_id = db.Column(db.Integer, db.ForeignKey("planets.id"))
    planet_to = db.relationship("Planets", foreign_keys=[planet_id],
                                 backref=db.backref("planet_favorites", lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "planet_id": self.planet_id}


class Planets(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    diameter = db.Column(db.Integer)
    rotation_period = db.Column(db.Integer)
    orbital_period = db.Column(db.Integer)
    gravity = db.Column(db.String(200))
    population = db.Column(db.Integer)
    climate = db.Column(db.String(200))
    terrain = db.Column(db.String(200))

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "diameter": self.diameter,
            "rotation_period": self.rotation_period,
            "orbital_period": self.orbital_period,
            "gravity": self.gravity,
            "population": self.population,
            "climate": self.climate,
            "terrain": self.terrain}
    
    def serialize_cards(self):
        return {
            "id": self.id,
            "name": self.name}


class StarshipFavorites(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user_to = db.relationship("Users", foreign_keys=[user_id],
                              backref=db.backref("user_starship_favorites", lazy="select"))
    starship_id = db.Column(db.Integer, db.ForeignKey("starships.id"))
    starship_to = db.relationship("Starships", foreign_keys=[starship_id],
                                 backref=db.backref("starship_favorites", lazy="select"))

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "starship_id": self.starship_id}


class Starships(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    consumables = db.Column(db.String(200))
    cargo_capacity = db.Column(db.Integer)
    passengers = db.Column(db.Integer)
    max_atmosphering_speed = db.Column(db.Integer)
    crew = db.Column(db.String(200))
    cost_in_credits = db.Column(db.Integer)
    length = db.Column(db.Integer)
    model = db.Column(db.String(400))
    manufacturer = db.Column(db.String(600))
    starship_class = db.Column(db.String(400))
    hyperdrive_rating = db.Column(db.Float)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "consumables": self.consumables,
            "cargo_capacity": self.cargo_capacity,
            "passengers": self.passengers,
            "max_atmosphering_speed": self.max_atmosphering_speed,
            "crew": self.crew,
            "cost_in_credits": self.cost_in_credits,
            "length": self.length,
            "model": self.model,
            "manufacturer": self.manufacturer,
            "starship_class": self.starship_class,
            "hyperdrive_rating": self.hyperdrive_rating}
    
    def serialize_cards(self):
        return {
            "id": self.id,
            "name": self.name}
