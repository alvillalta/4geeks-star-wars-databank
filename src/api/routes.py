"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, CharacterFavorites, Characters, PlanetFavorites, Planets, StarshipFavorites, Starships
import requests
from sqlalchemy import asc
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt
from datetime import datetime


api = Blueprint("api", __name__)
CORS(api)  # Allow CORS requests to this API


# Signup access token
@api.route("/signup", methods=["POST"])
def signup():
    response_body = {}
    user_to_post = request.json
    user = Users()
    user.email = user_to_post.get("email").lower()
    existing_user = db.session.execute(db.select(Users).where(Users.email == user.email)).scalar()
    if existing_user:
        response_body["message"] = f"User {user.email} already exists"
        response_body["results"] = None
        return jsonify(response_body), 409
    user.password = user_to_post.get("password")
    user.is_active = True
    user.is_admin = False
    user.first_name = user_to_post.get("first_name", None)
    user.last_name = user_to_post.get("last_name", None)
    db.session.add(user)
    db.session.commit()

    claims = {"user_id": user.id,
              "email": user.email,
              "first_name": user.first_name if user.first_name else None,
              "last_name": user.last_name if user.last_name else None}

    access_token = create_access_token(
        identity=user.email, additional_claims=claims)
    response_body["message"] = f"User {user.id} posted successfully"
    response_body["results"] = user.serialize_basic()
    response_body["access_token"] = access_token
    return jsonify(response_body), 201


# Login access token
@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    user_to_login = request.json
    email = user_to_login.get("email").lower()
    password = user_to_login.get("password")
    user = db.session.execute(db.select(Users).where(Users.email == email,
                                                     Users.password == password,
                                                     Users.is_active == True)).scalar()
    if not user:
        response_body["message"] = f"Bad email or password"
        response_body["results"] = None
        return jsonify(response_body), 401
    if not user.is_active:
        response_body["message"] = f"User {user.email} is no longer active"
        response_body["results"] = None
        return jsonify(response_body), 403

    claims = {"user_id": user.id,
              "email": user.email,
              "first_name": user.first_name if user.first_name else None,
              "last_name": user.last_name if user.last_name else None}

    access_token = create_access_token(
        identity=email, additional_claims=claims)
    response_body["message"] = f"User {user.email} logged successfully"
    response_body["results"] = user.serialize_basic()
    response_body["access_token"] = access_token
    return jsonify(response_body), 200


@api.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user(user_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    user_to_handle = db.session.execute(db.select(Users).where(Users.id == user_id)).scalar()
    if not user_to_handle:
        response_body["message"] = f"User {user_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        results = user_to_handle.serialize_full()
        response_body["message"] = f"User {user_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "PUT":
        if token_user_id != user_to_handle.id:
            response_body["message"] = f"User {token_user_id} is not allowed to put {user_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        data = request.json
        user_to_handle.first_name = data.get("first_name", user_to_handle.first_name)
        user_to_handle.last_name = data.get("last_name", user_to_handle.last_name)
        db.session.commit()
        results = user_to_handle.serialize_basic()
        response_body["message"] = f"User {user_to_handle.id} put successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "DELETE":
        if token_user_id != user_to_handle.id:
            response_body["message"] = f"User {token_user_id} is not allowed to delete {user_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        user_to_handle.is_active = False
        db.session.commit()
        response_body["message"] = f"User {user_to_handle.id} deleted successfully"
        response_body["results"] = None
        return jsonify(response_body), 204


@api.route("/users/<int:user_id>/favorites", methods=["GET"])
@jwt_required()
def handle_favorites(user_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    user_to_handle = db.session.execute(db.select(Users).where(Users.id == user_id)).scalar()
    if not user_to_handle:
        response_body["message"] = f"User {user_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        character_favorites = db.session.execute(db.select(CharacterFavorites).where(CharacterFavorites.user_id == user_id)).scalars().all()
        planet_favorites = db.session.execute(db.select(PlanetFavorites).where(PlanetFavorites.user_id == user_id)).scalars().all()
        starship_favorites = db.session.execute(db.select(StarshipFavorites).where(StarshipFavorites.user_id == user_id)).scalars().all()
        if not character_favorites and not planet_favorites and not starship_favorites:
            response_body["message"] = f"User {user_id} has no favorites"
            response_body["character_favorites"] = []
            response_body["planet_favorites"] = []
            response_body["starship_favorites"] = []
            return jsonify(response_body), 200
        character_results = [row.serialize() for row in character_favorites] if character_favorites else []
        planet_results = [row.serialize() for row in planet_favorites] if planet_favorites else []
        starship_results = [row.serialize() for row in starship_favorites] if starship_favorites else []
        response_body["message"] = f"User {user_id} favorites got successfully"
        response_body["character_favorites"] = character_results
        response_body["planet_favorites"] = planet_results
        response_body["starship_favorites"] = starship_results
        return jsonify(response_body), 200


@api.route("/characters")
def handle_characters():
    response_body = {}
    characters = db.session.execute(db.select(Characters)).scalars().all()
    if not characters:
        characters_url = "https://www.swapi.tech/api/people"
        while len(characters) < 20:
            request = requests.get(characters_url)
            if request.status_code != 200:
                response_body["message"] = f"External server error"
                response_body["results"] = None
                return jsonify(response_body), 500
            data = request.json()
            for row in data["results"]:
                new_character = Characters()
                new_character.id = row["uid"]
                new_character.name = row["name"]
                db.session.add(new_character)
            db.session.commit()
            characters = db.session.execute(db.select(Characters)).scalars().all()
            characters_url = data.get("next")
            if not characters_url:
                response_body["message"] = f"Error getting results from external server"
                response_body["results"] = None
                return jsonify(response_body), 404
        if not characters:
            response_body["message"] = f"Error getting characters"
            response_body["results"] = None
            return jsonify(response_body), 404
    results = [row.serialize_cards() for row in characters]
    response_body["message"] = f"Characters got successfully"
    response_body["results"] = results
    return jsonify(response_body), 200


@api.route("/characters/<int:character_id>", methods=["GET"])
def handle_character_details(character_id):
    response_body = {}
    character = db.session.execute(db.select(Characters).where(Characters.id == character_id)).scalar()
    if not character:
        response_body["message"] = f"Character {character_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if not character.height:  # Checking property height to see if the character is already saved in the data base
        character_url = f"https://www.swapi.tech/api/people/{character_id}"
        external_response = requests.get(character_url)
        if external_response.status_code != 200:
            response_body["message"] = f"External server error"
            response_body["results"] = None
            return jsonify(response_body), 500
        data = external_response.json()
        clean_data = data["result"]["properties"]
        character.height = clean_data.get("height")
        character.mass = clean_data.get("mass", None)
        character.hair_color = clean_data.get("hair_color", None)
        character.skin_color = clean_data.get("skin_color", None)
        character.eye_color = clean_data.get("eye_color", None)
        character.birth_year = clean_data.get("birth_year", None)
        character.gender = clean_data.get("gender", None)
        db.session.commit()
        if not character.height:
            response_body["message"] = f"Error getting character {character_id}"
            response_body["results"] = None
            return jsonify(response_body), 404
    if request.method == "GET":      
        results = character.serialize()
        response_body["message"] = f"Character {character_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("characters/<int:character_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_characters(character_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    character_exists = db.session.execute(db.select(Characters).where(Characters.id == character_id)).scalar()
    if not character_exists:
        response_body["message"] = f"Character {character_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(CharacterFavorites).where(CharacterFavorites.user_id == token_user_id),
                                                                                     CharacterFavorites.character_id == character_id).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has character {character_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_character = CharacterFavorites()
        favorite_character.user_id = token_user_id
        favorite_character.character_id = character_id
        db.session.add(favorite_character)
        db.session.commit()
        results = favorite_character.serialize()
        response_body["message"] = f"User {token_user_id} saved character {character_id} as favorite"
        response_body["results"] = results
        return jsonify(response_body), 201
    if request.method == "DELETE":
        if not favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has not character {character_id} saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        db.session.delete(favorite_already_exists)
        db.session.commit()
        response_body["message"] = f"User {token_user_id} deleted successfully character {character_id} from favorites"
        response_body["results"] = None
        return jsonify(response_body), 204
    

@api.route("/planets")
def handle_planets():
    response_body = {}
    planets = db.session.execute(db.select(Planets)).scalars().all()
    if not planets:
        planets_url = "https://www.swapi.tech/api/planets"
        while len(planets) < 20:
            request = requests.get(planets_url)
            if request.status_code != 200:
                response_body["message"] = f"External server error"
                response_body["results"] = None
                return jsonify(response_body), 500
            data = request.json()
            for row in data["results"]:
                new_planet = Planets()
                new_planet.id = row["uid"]
                new_planet.name = row["name"]
                db.session.add(new_planet)
            db.session.commit()
            planets = db.session.execute(db.select(Planets)).scalars().all()
            planets_url = data.get("next")
            if not planets_url:
                response_body["message"] = f"Error getting results from external server"
                response_body["results"] = None
                return jsonify(response_body), 404
        if not planets:
            response_body["message"] = f"Error getting planets"
            response_body["results"] = None
            return jsonify(response_body), 404
    results = [row.serialize_cards() for row in planets]
    response_body["message"] = f"Planets got successfully"
    response_body["results"] = results
    return jsonify(response_body), 200


@api.route("/planets/<int:planet_id>", methods=["GET"])
def handle_planet_details(planet_id):
    response_body = {}
    planet = db.session.execute(db.select(Planets).where(Planets.id == planet_id)).scalar()
    if not planet:
        response_body["message"] = f"Planet {planet_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if not planet.diameter:
        planet_url = f"https://www.swapi.tech/api/planets/{planet_id}"
        external_response = requests.get(planet_url)
        if external_response.status_code != 200:
            response_body["message"] = f"External server error"
            response_body["results"] = None
            return jsonify(response_body), 500
        data = external_response.json()
        clean_data = data["result"]["properties"]
        planet.diameter = clean_data.get("diameter")
        planet.rotation_period = clean_data.get("rotation_period", None)
        planet.orbital_period = clean_data.get("orbital_period", None)
        planet.gravity = clean_data.get("gravity", None)
        planet.population = clean_data.get("population", None)
        planet.climate = clean_data.get("climate", None)
        planet.terrain = clean_data.get("terrain", None)
        db.session.commit()
        if not planet.diameter:
            response_body["message"] = f"Error getting planet {planet_id}"
            response_body["results"] = None
            return jsonify(response_body), 404
    if request.method == "GET":      
        results = planet.serialize()
        response_body["message"] = f"Planet {planet_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("planets/<int:planet_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_planets(planet_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    planet_exists = db.session.execute(db.select(Planets).where(Planets.id == planet_id)).scalar()
    if not planet_exists:
        response_body["message"] = f"Planet {planet_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(PlanetFavorites).where(PlanetFavorites.user_id == token_user_id),
                                                                                     PlanetFavorites.planet_id == planet_id).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has planet {planet_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_planet = PlanetFavorites()
        favorite_planet.user_id = token_user_id
        favorite_planet.planet_id = planet_id
        db.session.add(favorite_planet)
        db.session.commit()
        results = favorite_planet.serialize()
        response_body["message"] = f"User {token_user_id} saved planet {planet_id} as favorite"
        response_body["results"] = results
        return jsonify(response_body), 201
    if request.method == "DELETE":
        if not favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has not planet {planet_id} saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        db.session.delete(favorite_already_exists)
        db.session.commit()
        response_body["message"] = f"User {token_user_id} deleted successfully planet {planet_id} from favorites"
        response_body["results"] = None
        return jsonify(response_body), 204
    

@api.route("/starships")
def handle_starships():
    response_body = {}
    starships = db.session.execute(db.select(Starships)).scalars().all()
    if not starships:
        starships_url = "https://www.swapi.tech/api/starships"
        while len(starships) < 20:
            request = requests.get(starships_url)
            if request.status_code != 200:
                response_body["message"] = f"External server error"
                response_body["results"] = None
                return jsonify(response_body), 500
            data = request.json()
            for row in data["results"]:
                new_starship = Starships()
                new_starship.id = row["uid"]
                new_starship.name = row["name"]
                db.session.add(new_starship)
            db.session.commit()
            starships = db.session.execute(db.select(Starships)).scalars().all()
            starships_url = data.get("next")
            if not starships_url:
                response_body["message"] = f"Error getting results from external server"
                response_body["results"] = None
                return jsonify(response_body), 404
        if not starships:
            response_body["message"] = f"Error getting starships"
            response_body["results"] = None
            return jsonify(response_body), 404
    results = [row.serialize_cards() for row in starships]
    response_body["message"] = f"Starships got successfully"
    response_body["results"] = results
    return jsonify(response_body), 200


@api.route("/starships/<int:starship_id>", methods=["GET"])
def handle_starship_details(starship_id):
    response_body = {}
    starship = db.session.execute(db.select(Starships).where(Starships.id == starship_id)).scalar()
    if not starship:
        response_body["message"] = f"Starship {starship_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if not starship.length:  
        starship_url = f"https://www.swapi.tech/api/starships/{starship_id}"
        external_response = requests.get(starship_url)
        if external_response.status_code != 200:
            response_body["message"] = f"External server error"
            response_body["results"] = None
            return jsonify(response_body), 500
        data = external_response.json()
        clean_data = data["result"]["properties"]
        starship.consumables = clean_data.get("consumables", None)
        starship.cargo_capacity = clean_data.get("cargo_capacity", None)
        starship.passengers = clean_data.get("passengers", None)
        starship.max_atmosphering_speed = clean_data.get("max_atmosphering_speed", None)
        starship.cost_in_credits = clean_data.get("cost_in_credits", None)
        starship.length = clean_data.get("length", None)
        starship.model = clean_data.get("model", None)
        starship.manufacturer = clean_data.get("manufacturer", None)
        starship.starship_class = clean_data.get("starship_class", None)
        starship.hyperdrive_rating = clean_data.get("hyperdrive_rating", None)
        db.session.commit()
        if not starship.length:
            response_body["message"] = f"Error getting starship {starship_id}"
            response_body["results"] = None
            return jsonify(response_body), 404
    if request.method == "GET":      
        results = starship.serialize()
        response_body["message"] = f"Starship {starship_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200


@api.route("starships/<int:starship_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_starships(starship_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    starship_exists = db.session.execute(db.select(Starships).where(Starships.id == starship_id)).scalar()
    if not starship_exists:
        response_body["message"] = f"Starship {starship_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(StarshipFavorites).where(StarshipFavorites.user_id == token_user_id),
                                                                                    StarshipFavorites.starship_id == starship_id).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has starship {starship_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_starship = StarshipFavorites()
        favorite_starship.user_id = token_user_id
        favorite_starship.starship_id = starship_id
        db.session.add(favorite_starship)
        db.session.commit()
        results = favorite_starship.serialize()
        response_body["message"] = f"User {token_user_id} saved starship {starship_id} as favorite"
        response_body["results"] = results
        return jsonify(response_body), 201
    if request.method == "DELETE":
        if not favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has not starship {starship_id} saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        db.session.delete(favorite_already_exists)
        db.session.commit()
        response_body["message"] = f"User {token_user_id} deleted successfully starship {starship_id} from favorites"
        response_body["results"] = None
        return jsonify(response_body), 204
