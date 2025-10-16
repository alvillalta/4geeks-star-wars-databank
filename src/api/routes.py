"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from api.utils import generate_sitemap, APIException
from api.models import db, Users, CharacterFavorites, Characters, PlanetFavorites, Planets, StarshipFavorites, Starships
from flask_jwt_extended import create_access_token
from flask_jwt_extended import decode_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy import asc
from sqlalchemy import and_
import smtplib
import ssl
from email.message import EmailMessage
import requests
import re
import os


backend_url = os.getenv("VITE_BACKEND_URL")
email_user = os.getenv("EMAIL_USER")
email_pass = os.getenv("EMAIL_PASS")
smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", 465))


api = Blueprint("api", __name__)
CORS(api)  # Allow CORS requests to this API


def validate_email(email):
        if not isinstance(email, str):
            return "Invalid email"
        elif not len(email) <= 100:
            return "Email must be less than 100 characters"
        elif any(character.isspace() for character in email):
            return "Email must not contain any blank space"
        elif not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
            return "Use a valid email"
        else: return None

def validate_password(password):
        symbols = "@$!%-*?&"
        if not isinstance(password, str):
            return "Invalid password"
        elif not 8 <= len(password):
            return "Password must be more than 8 characters"
        elif not len(password) <= 64:
            return "Password must be less than 64 characters"
        elif any(character.isspace() for character in password):
            return "Password must not contain any blank space"
        elif not any(character.islower() for character in password):
            return "Password must contain at least one lowercase letter"
        elif not any(character.isupper() for character in password):
            return "Password must contain at least one capital letter"
        elif not any(character.isdigit() for character in password):
            return "Password must contain at least one number"
        elif not any(character in symbols for character in password):
            return "Password must contain at least one of these symbols: @$!%-*?&"
        else: return None

def validate_name(name):
        if not isinstance(name, str):
            return "name must be a valid text"
        elif not len(name) <= 50:
            return "name must be less than 50 characters"
        else: return None

def send_mail(to_email, subject, body):
    message = EmailMessage()
    message["From"] = email_user
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)
    context = ssl.create_default_context()
    mail_sent = {}
    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
            server.login(email_user, email_pass)
            server.send_message(message)
        mail_sent["message"] = f"Mail has been sent successfully"
        mail_sent["results"] = True
        return mail_sent
    except Exception as error:
        mail_sent["message"] = f"Error sending mail: {error}"
        mail_sent["results"] = False
        return mail_sent
        

@api.route("/signup", methods=["POST"])
def signup():
    response_body = {}
    user_to_post = request.json
    user = Users()
    email_exists = user_to_post.get("email", None)
    if not email_exists or email_exists.strip() == "":
        response_body["message"] = f"Email is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    email = email_exists.lower()
    email_validation_error = validate_email(email)
    if email_validation_error:
        response_body["message"] = email_validation_error
        response_body["results"] = None
        return jsonify(response_body), 400
    existing_user = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if existing_user:
        response_body["message"] = f"User already exists"
        response_body["results"] = None
        return jsonify(response_body), 409
    user.email = email
    plain_password = user_to_post.get("password", None)
    repeat_password = user_to_post.get("repeat_password", None)
    if not plain_password or plain_password.strip() == "":
        response_body["message"] = f"Password is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    if plain_password != repeat_password:
        response_body["message"] = f"Passwords do not match"
        response_body["results"] = None
        return jsonify(response_body), 400
    password_validation_error = validate_password(plain_password)
    if password_validation_error:
        response_body["message"] = password_validation_error
        response_body["results"] = None
        return jsonify(response_body), 400
    user.password = user.set_password(plain_password)
    first_name = user_to_post.get("first_name", None)
    if not first_name or first_name.strip() == "":
        user.first_name = None
    if first_name:
        name_validation_error = validate_name(first_name)
        if name_validation_error:
            response_body["message"] = f"First {name_validation_error}"
            response_body["results"] = None
            return jsonify(response_body), 400
        user.first_name = first_name
    last_name = user_to_post.get("last_name", None)
    if not last_name or last_name.strip() == "":
        user.last_name = None
    if last_name:
        name_validation_error = validate_name(last_name)
        if name_validation_error:
            response_body["message"] = f"Last {name_validation_error}"
            response_body["results"] = None
            return jsonify(response_body), 400
        user.last_name = last_name   
    user.is_active = True
    db.session.add(user)
    db.session.commit()
    claims = {
        "user_id": user.id, 
        "email": user.email}
    access_token = create_access_token(identity=f"{user.id}", additional_claims=claims, expires_delta=timedelta(minutes=60))
    response_body["message"] = f"User {user.id} posted successfully"
    response_body["results"] = user.serialize_basic()
    response_body["access_token"] = access_token
    return jsonify(response_body), 201


@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    user_to_login = request.json
    email_exists = user_to_login.get("email", None)
    if not email_exists or email_exists.strip() == "":
        response_body["message"] = f"Email is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    email = email_exists.lower()
    email_validation_error = validate_email(email)
    if email_validation_error:
        response_body["message"] = email_validation_error
        response_body["results"] = None
        return jsonify(response_body), 400
    password = user_to_login.get("password", None)
    if not password or password.strip() == "":
        response_body["message"] = f"Password is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    user = db.session.execute(db.select(Users).where(and_(Users.email == email,
                                                          Users.is_active == True))).scalar()
    if not user or not user.check_password(password):
        response_body["message"] = f"Invalid credentials"
        response_body["results"] = None
        return jsonify(response_body), 401
    claims = {
        "user_id": user.id, 
        "email": user.email}
    access_token = create_access_token(identity=f"{user.id}", additional_claims=claims, expires_delta=timedelta(minutes=60))
    response_body["message"] = f"User {user.email} logged successfully"
    response_body["results"] = user.serialize_basic()
    response_body["access_token"] = access_token
    return jsonify(response_body), 200


@api.route("/recover-password", methods=["POST"])
def recover_password():
    response_body = {}
    user_to_recover = request.json
    recovery_email_exists = user_to_recover.get("recovery_email", None)
    if not recovery_email_exists or recovery_email_exists.strip() == "":
        response_body["message"] = f"Email is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    recovery_email = recovery_email_exists.lower()
    email_validation_error = validate_email(recovery_email)
    if email_validation_error:
        response_body["message"] = email_validation_error
        response_body["results"] = None
        return jsonify(response_body), 400
    user = db.session.execute(db.select(Users).where(and_(Users.email == recovery_email,
                                                          Users.is_active == True))).scalar()
    if not user:
        response_body["message"] = f"Invalid email"
        response_body["results"] = None
        return jsonify(response_body), 401
    reset_token = create_access_token(identity=f"{user.id}", expires_delta=timedelta(minutes=30))
    reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    user.reset_token = reset_token
    user.reset_token_expires_at = reset_token_expires_at
    db.session.commit()
    reset_link = f"{backend_url}/reset-password?token={reset_token}"
    mail_sent = send_mail(
        user.email, 
        "Reset your Star Wars account password", 
        f"Please click here to reset your password: {reset_link}")
    if mail_sent["results"] == False:
        response_body["error"] = mail_sent["message"]
        response_body["message"] = "Something went wrong"
        response_body["results"] = None
        return jsonify(response_body), 400
    response_body["message"] = f"If the email exists, check your inbox"
    response_body["results"] = None
    return jsonify(response_body), 200


@api.route("/reset-password", methods=["POST"])
def reset_password():
    response_body = {}
    data = request.json
    reset_token = data.get("token")
    decoded_token = decode_token(reset_token)
    user_id = decoded_token["sub"]
    if not user_id:
        response_body["message"] = f"Invalid credentials"
        response_body["results"] = None
        return jsonify(response_body), 401
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")
    if not new_password or new_password.strip() == "":
        response_body["message"] = f"Password is required"
        response_body["results"] = None
        return jsonify(response_body), 400
    if new_password != confirm_password:
        response_body["message"] = f"Passwords do not match"
        response_body["results"] = None
        return jsonify(response_body), 400
    password_validation_error = validate_password(new_password)
    if password_validation_error:
        response_body["message"] = password_validation_error
        response_body["results"] = None
        return jsonify(response_body), 400
    user = db.session.execute(db.select(Users).where(and_(Users.id == user_id,
                                                          Users.is_active == True))).scalar()
    if not user:
        response_body["message"] = f"User to recover not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if user.reset_token != reset_token:
        response_body["message"] = "Invalid reset token"
        response_body["results"] = None
        return jsonify(response_body), 400
    if user.reset_token_expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        response_body["message"] = f"Time out for resetting the password"
        response_body["results"] = None
        return jsonify(response_body), 400
    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.session.commit()
    response_body["message"] = f"Password reset successfully"
    response_body["results"] = None
    return jsonify(response_body), 200


@api.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def handle_user(user_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
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
        user_to_put = request.json
        first_name = user_to_put.get("first_name", None)
        if not first_name or first_name.strip() == "":
            user_to_handle.first_name = None
        if first_name:
            name_validation_error = validate_name(first_name)
            if name_validation_error:
                response_body["message"] = f"First {name_validation_error}"
                response_body["results"] = None
                return jsonify(response_body), 400
            user_to_handle.first_name = first_name
        last_name = user_to_put.get("last_name", None)
        if not last_name or last_name.strip() == "":
            user_to_handle.last_name = None
        if last_name:
            name_validation_error = validate_name(last_name)
            if name_validation_error:
                response_body["message"] = f"Last {name_validation_error}"
                response_body["results"] = None
                return jsonify(response_body), 400
            user_to_handle.last_name = last_name
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
        return jsonify(response_body), 200


@api.route("/users/<int:user_id>/favorites", methods=["GET"])
@jwt_required()
def handle_favorites(user_id):
    response_body = {}
    user_to_handle = db.session.execute(db.select(Users).where(Users.id == user_id)).scalar()
    if not user_to_handle:
        response_body["message"] = f"User {user_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        character_favorites = db.session.execute(db.select(CharacterFavorites).where(CharacterFavorites.user_id == user_id).order_by(asc(CharacterFavorites.created_at))).scalars()
        planet_favorites = db.session.execute(db.select(PlanetFavorites).where(PlanetFavorites.user_id == user_id).order_by(asc(PlanetFavorites.created_at))).scalars()
        starship_favorites = db.session.execute(db.select(StarshipFavorites).where(StarshipFavorites.user_id == user_id).order_by(asc(StarshipFavorites.created_at))).scalars()
        if not character_favorites and not planet_favorites and not starship_favorites:
            response_body["message"] = f"User {user_id} has no favorites"
            response_body["characterFavorites"] = []
            response_body["planetFavorites"] = []
            response_body["starshipFavorites"] = []
            return jsonify(response_body), 200
        character_results = [row.serialize() for row in character_favorites] if character_favorites else []
        planet_results = [row.serialize() for row in planet_favorites] if planet_favorites else []
        starship_results = [row.serialize() for row in starship_favorites] if starship_favorites else []
        response_body["message"] = f"User {user_id} favorites got successfully"
        response_body["characterFavorites"] = character_results
        response_body["planetFavorites"] = planet_results
        response_body["starshipFavorites"] = starship_results
        return jsonify(response_body), 200


@api.route("/characters")
def handle_characters():
    response_body = {}
    characters = db.session.execute(db.select(Characters).order_by(Characters.id)).scalars().all()
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
            characters = db.session.execute(db.select(Characters).order_by(Characters.id)).scalars().all()
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


@api.route("/characters/<int:character_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_characters(character_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    character_exists = db.session.execute(db.select(Characters).where(Characters.id == character_id)).scalar()
    if not character_exists:
        response_body["message"] = f"Character {character_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(CharacterFavorites).where(and_(CharacterFavorites.user_id == token_user_id,
                                                                                          CharacterFavorites.character_id == character_id))).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has character {character_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_character = CharacterFavorites()
        favorite_character.user_id = token_user_id
        favorite_character.character_id = character_id
        favorite_character.created_at = datetime.now(timezone.utc)
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
        return jsonify(response_body), 200
    

@api.route("/planets")
def handle_planets():
    response_body = {}
    planets = db.session.execute(db.select(Planets).order_by(Planets.id)).scalars().all()
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
            planets = db.session.execute(db.select(Planets).order_by(Planets.id)).scalars().all()
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


@api.route("/planets/<int:planet_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_planets(planet_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    planet_exists = db.session.execute(db.select(Planets).where(Planets.id == planet_id)).scalar()
    if not planet_exists:
        response_body["message"] = f"Planet {planet_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(PlanetFavorites).where(and_(PlanetFavorites.user_id == token_user_id,
                                                                                       PlanetFavorites.planet_id == planet_id))).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has planet {planet_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_planet = PlanetFavorites()
        favorite_planet.user_id = token_user_id
        favorite_planet.planet_id = planet_id
        favorite_planet.created_at = datetime.now(timezone.utc)
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
        return jsonify(response_body), 200
    

@api.route("/starships")
def handle_starships():
    response_body = {}
    starships = db.session.execute(db.select(Starships).order_by(Starships.id)).scalars().all()
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
            starships = db.session.execute(db.select(Starships).order_by(Starships.id)).scalars().all()
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


@api.route("/starships/<int:starship_id>", methods=["POST", "DELETE"])
@jwt_required()
def handle_favorite_starships(starship_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    starship_exists = db.session.execute(db.select(Starships).where(Starships.id == starship_id)).scalar()
    if not starship_exists:
        response_body["message"] = f"Starship {starship_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    favorite_already_exists = db.session.execute(db.select(StarshipFavorites).where(and_(StarshipFavorites.user_id == token_user_id,
                                                                                         StarshipFavorites.starship_id == starship_id))).scalar()
    if request.method == "POST":
        if favorite_already_exists:
            response_body["message"] = f"User {token_user_id} has starship {starship_id} already saved as favorite"
            response_body["results"] = None
            return jsonify(response_body), 409
        favorite_starship = StarshipFavorites()
        favorite_starship.user_id = token_user_id
        favorite_starship.starship_id = starship_id
        favorite_starship.created_at = datetime.now(timezone.utc)
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
        return jsonify(response_body), 200
