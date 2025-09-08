"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models import db, Users, Followers, Posts, Media, Comments
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
    existing_user = db.session.execute(
        db.select(Users).where(Users.email == user.email)).scalar()
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
              "is_active": user.is_active,
              "is_admin": user.is_admin,
              "first_name": user.first_name if user.first_name else None,
              "last_name": user.last_name if user.last_name else None,
              "followers": [],
              "following": [],
              "posts": [],
              "comments": []}

    access_token = create_access_token(
        identity=user.email, additional_claims=claims)
    response_body["message"] = f"User {user.id} posted successfully"
    response_body["results"] = user.serialize()
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
              "is_active": user.is_active,
              "is_admin": user.is_admin,
              "first_name": user.first_name if user.first_name else None,
              "last_name": user.last_name if user.last_name else None,
              "followers": [row.serialize()["follower_id"] for row in user.following_to] if user.following_to else [],
              "following": [row.serialize()["following_id"] for row in user.follower_to] if user.follower_to else [],
              "posts": [row.serialize()["id"] for row in user.user_posts] if user.user_posts else [],
              "comments": [row.serialize() for row in user.user_comments] if user.user_comments else []}

    access_token = create_access_token(
        identity=email, additional_claims=claims)
    response_body["message"] = f"User {user.email} logged successfully"
    response_body["results"] = user.serialize()
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
        results = user_to_handle.serialize()
        response_body["message"] = f"User {user_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "PUT":
        if token_user_id != user_to_handle.id:
            response_body["message"] = f"User {token_user_id} is not allowed to put {user_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        data = request.json
        user_to_handle.email = data.get("email", user_to_handle.email)
        user_to_handle.first_name = data.get("first_name", user_to_handle.first_name)
        user_to_handle.last_name = data.get("last_name", user_to_handle.last_name)
        db.session.commit()
        response_body["message"] = f"User {user_to_handle.id} put successfully"
        response_body["results"] = user_to_handle.serialize()
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
            response_body["results"] = {"character_favorites": [],
                                        "planet_favorites": [],
                                        "starship_favorites": []}
            return jsonify(response_body), 200
        character_results = [row.serialize() for row in character_favorites] if character_favorites else []
        planet_results = [row.serialize() for row in planet_favorites] if planet_favorites else []
        starship_results = [row.serialize() for row in starship_favorites] if starship_favorites else []
        response_body["message"] = f"User {user_id} favorites got successfully"
        response_body["results"] = {"character_favorites": character_results,
                                    "planet_favorites": planet_results,
                                    "starship_favorites": starship_results}
        return jsonify(response_body), 200
    

@api.route("/followers", methods=["GET", "POST"])
@jwt_required()
def handle_followers():
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    if request.method == "GET":
        followers = db.session.execute(db.select(Followers).where(
            Followers.following_id == token_user_id)).scalars()
        following = db.session.execute(db.select(Followers).where(
            Followers.follower_id == token_user_id)).scalars()
        if not followers and not following:
            response_body["message"] = f"User {token_user_id} does not follow or is followed by anyone"
            response_body["results"] = {"following": [],
                                        "followers": []}
            return jsonify(response_body), 200
        if not followers:
            following_results = [row.serialize() for row in following]
            response_body["message"] = f"Users followed by user {token_user_id} got successfully"
            response_body["results"] = {"following": following_results,
                                        "followers": []}
            return jsonify(response_body), 200
        if not following:
            followers_results = [row.serialize() for row in followers]
            response_body["message"] = f"Followers of user {token_user_id} got successfully"
            response_body["results"] = {"following": [],
                                        "followers": followers_results}
            return jsonify(response_body), 200
        following_results = [row.serialize() for row in following]
        followers_results = [row.serialize() for row in followers]
        response_body["message"] = f"Followers and followed by user {token_user_id} got successfully"
        response_body["results"] = {"following": following_results,
                                    "followers": followers_results}
        return jsonify(response_body), 200
    if request.method == "POST":
        data = request.json
        following_id = data.get("following_id", None)
        follow_exists = db.session.execute(
            db.select(Users).where(Users.id == following_id)).scalar()
        if not follow_exists:
            response_body["message"] = f"User {following_id} not found"
            response_body["results"] = None
            return jsonify(response_body), 404
        already_following = db.session.execute(db.select(Followers).where(Followers.follower_id == token_user_id,
                                                                          Followers.following_id == following_id)).scalar()
        if already_following:
            response_body["message"] = f"User {token_user_id} is already following {following_id}"
            response_body["results"] = None
            return jsonify(response_body), 409
        follower = Followers()
        follower.follower_id = token_user_id
        follower.following_id = following_id
        db.session.add(follower)
        db.session.commit()
        results = follower.serialize()
        response_body["message"] = f"User {token_user_id} now follows user {following_id}"
        response_body["results"] = results
        return jsonify(response_body), 201


@api.route("/followers/<int:following_id>", methods=["DELETE"])
@jwt_required()
def handle_follower(following_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    following_user = db.session.execute(db.select(Followers).where(Followers.follower_id == token_user_id,
                                                                   Followers.following_id == following_id)).scalar()
    if not following_user:
        response_body["message"] = f"Following user {following_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "DELETE":
        db.session.delete(following_user)
        db.session.commit()
        response_body["message"] = f"Following user {following_id} deleted successfully"
        response_body["results"] = None
        return jsonify(response_body), 200


@api.route("/posts", methods=["GET", "POST"])
@jwt_required()
def handle_posts():
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    if request.method == "GET":
        posts = db.session.execute(db.select(Posts).where(
            Posts.user_id == token_user_id)).scalars().all()
        if not posts:
            response_body["message"] = f"User {token_user_id} has not posted anything yet"
            response_body["results"] = []
            return jsonify(response_body), 200
        results = [row.serialize() for row in posts]
        response_body["message"] = f"Posts from user {token_user_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "POST":
        data = request.json
        title = data.get("title", None)
        description = data.get("description", None)
        body = data.get("body", None)
        date = datetime.now().date()
        user_id = token_user_id
        post = Posts()
        post.title = title
        post.description = description
        post.body = body
        post.date = date
        post.user_id = user_id
        db.session.add(post)
        db.session.commit()
        results = post.serialize()
        response_body["message"] = f"User {token_user_id} posted a new post"
        response_body["results"] = results
        return jsonify(response_body), 201


@api.route("/posts/<int:post_id>/comments", methods=["GET", "POST"])
@jwt_required()
def handle_comments(post_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    post_exists = db.session.execute(
        db.select(Posts).where(Posts.id == post_id)).scalar()
    if not post_exists:
        response_body["message"] = f"Post {post_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        comments = db.session.execute(db.select(Comments).where(
            Comments.post_id == post_id)).scalars().all()
        if not comments:
            response_body["message"] = f"There are no comments in post {post_id}"
            response_body["results"] = []
            return jsonify(response_body), 200
        results = [row.serialize() for row in comments]
        response_body["message"] = f"Comments from post {post_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "POST":
        data = request.json
        body = data.get("body", None)
        comment = Comments()
        comment.body = body
        comment.user_id = token_user_id
        comment.post_id = post_id
        db.session.add(comment)
        db.session.commit()
        results = comment.serialize()
        response_body["message"] = f"User {token_user_id} posted a new comment in post {post_id}"
        response_body["results"] = results
        return jsonify(response_body), 201


@api.route("/posts/<int:post_id>/media", methods=["GET", "POST"])
@jwt_required()
def handle_media(post_id):
    response_body = {}
    claims = get_jwt()
    token_user_id = claims["user_id"]
    if not token_user_id:
        response_body["message"] = "Current user not found"
        response_body["results"] = None
        return jsonify(response_body), 401
    post_exists = db.session.execute(
        db.select(Posts).where(Posts.id == post_id)).scalar()
    if not post_exists:
        response_body["message"] = f"Post {post_id} not found"
        response_body["results"] = None
        return jsonify(response_body), 404
    if request.method == "GET":
        medium = db.session.execute(db.select(Media).where(
            Media.post_id == post_id)).scalar()
        if not medium:
            response_body["message"] = f"There is no medium in post {post_id}"
            response_body["results"] = None
            return jsonify(response_body), 404
        results = medium.serialize()
        response_body["message"] = f"Medium from post {post_id} got successfully"
        response_body["results"] = results
        return jsonify(response_body), 200
    if request.method == "POST":
        post_owner = post_exists.user_id
        user_owns_post = post_owner == token_user_id
        if not user_owns_post:
            response_body["message"] = f"User {token_user_id} is not allowed to add a medium to post {post_id}"
            response_body["results"] = None
            return jsonify(response_body), 403
        data = request.json
        medium_type = data.get("medium_type", None)
        if medium_type not in ["image", "video", "audio"]:
            response_body["message"] = f"Invalid medium_type: {medium_type}"
            response_body["results"] = None
            return jsonify(response_body), 400
        url = data.get("url", None)
        if not url:
            response_body["message"] = f"Error in adding medium to post {post_id}"
            response_body["results"] = None
            return jsonify(response_body), 400
        medium = Media()
        medium.url = url
        medium.medium_type = medium_type
        medium.post_id = post_id
        db.session.add(medium)
        db.session.commit()
        results = medium.serialize()
        response_body["message"] = f"User {token_user_id} added a new medium to post {post_id}"
        response_body["results"] = results
        return jsonify(response_body), 201
