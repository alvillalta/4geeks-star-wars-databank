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

    def serialize_basic(self):
        return {"id": self.id,
                "email": self.email,
                "is_active": self.is_active,
                "is_admin": self.is_admin,
                "first_name": self.first_name,
                "last_name": self.last_name}
    
    def serialize_full(self):
        return {"id": self.id,
                "email": self.email,
                "is_active": self.is_active,
                "is_admin": self.is_admin,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "character_favorites": [row.character_to.serialize_cards() for row in self.user_character_favorites] if self.user_character_favorites else [],
                "planet_favorites": [row.planet_to.serialize_cards() for row in self.user_planet_favorites] if self.user_planet_favorites else [],
                "starship_favorites": [row.starship_to.serialize_cards() for row in self.user_starship_favorites] if self.user_starship_favorites else []}


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
            "character_id": self.character_id,
            "character_name": self.character_to.name if self.character_to else None}


class Characters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    height = db.Column(db.String(50))
    mass = db.Column(db.String(50))
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
            "planet_id": self.planet_id,
            "planet_name": self.planet_to.name if self.planet_to else None}


class Planets(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    diameter = db.Column(db.Integer)
    rotation_period = db.Column(db.String(50))
    orbital_period = db.Column(db.String(50))
    gravity = db.Column(db.String(200))
    population = db.Column(db.String(50))
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
            "starship_id": self.starship_id,
            "starship_name": self.starship_to.name if self.starship_to else None}


class Starships(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), unique=True, nullable=False)
    consumables = db.Column(db.String(200))
    cargo_capacity = db.Column(db.String(50))
    passengers = db.Column(db.String(50))
    max_atmosphering_speed = db.Column(db.String(50))
    crew = db.Column(db.String(200))
    cost_in_credits = db.Column(db.String(50))
    length = db.Column(db.String(50))
    model = db.Column(db.String(400))
    manufacturer = db.Column(db.String(600))
    starship_class = db.Column(db.String(400))
    hyperdrive_rating = db.Column(db.String(50))

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
