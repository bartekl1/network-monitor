from flask import Flask, render_template, send_file, redirect, url_for, request
from flask_login import LoginManager, login_required, logout_user, login_user, UserMixin, current_user
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import mysql.connector

import json
import random
import time
import string
import hashlib

with open("configs.json") as file:
    configs = json.load(file)

login_manager = LoginManager()
app = Flask(__name__)
app.secret_key = configs["secret_key"]
login_manager.init_app(app)


class User(UserMixin):
    def __init__(self, user_id, alternative_id, username, password_hash, email):
        self.user_id = user_id
        self.alternative_id = alternative_id
        self.username = username
        self.password_hash = password_hash
        self.email = email
        self.profile_picture_url = f"https://gravatar.com/avatar/{hashlib.sha256(self.email.strip().lower().encode('utf-8')).hexdigest()}?s=200&d=mp"

    def get_id(self):
        return self.alternative_id

    def check_password(self, password):
        ph = PasswordHasher()
        try:
            ph.verify(self.password_hash, password)
        except VerifyMismatchError:
            return False
        else:
            if ph.check_needs_rehash(self.password_hash):
                self.change_password(password)
            return True

    def change_password(self, new_password):
        ph = PasswordHasher()

        self.alternative_id = "".join(random.choices(string.ascii_letters + string.digits, k=50)) + str(int(time.time() * 100))
        self.password_hash = ph.hash(new_password)

        db = mysql.connector.connect(**configs['mysql'])
        cursor = db.cursor(dictionary=True)

        cursor.execute("UPDATE users SET alternative_id = %s, password_hash = %s WHERE id = %s", (self.alternative_id, self.password_hash, self.user_id))

        db.commit()
        cursor.close()
        db.close()

    def change_username(self, new_username):
        db = mysql.connector.connect(**configs['mysql'])
        cursor = db.cursor(dictionary=True)

        cursor.execute("UPDATE users SET username = %s WHERE id = %s", (new_username, self.user_id))

        db.commit()
        cursor.close()
        db.close()

    def change_email(self, new_email):
        db = mysql.connector.connect(**configs['mysql'])
        cursor = db.cursor(dictionary=True)

        cursor.execute("UPDATE users SET email = %s WHERE id = %s", (new_email, self.user_id))

        db.commit()
        cursor.close()
        db.close()


def get_user(alternative_id=None, username=None):
    db = mysql.connector.connect(**configs['mysql'])
    cursor = db.cursor(dictionary=True)

    if alternative_id is not None:
        cursor.execute("SELECT * FROM users WHERE alternative_id = %s LIMIT 1", (alternative_id, ))
    elif username is not None:
        cursor.execute("SELECT * FROM users WHERE username = %s LIMIT 1", (username, ))
    else:
        return None

    result = cursor.fetchall()
    cursor.close()
    db.close()

    if len(result) == 1:
        return User(user_id=result[0]["id"],
                    alternative_id=result[0]["alternative_id"],
                    username=result[0]["username"],
                    password_hash=result[0]["password_hash"],
                    email=result[0]["email"])
    return None


class Host:
    def __init__(self, host_id, ip_address, mac_address, description, icon, manufacturer, known, first_detected, last_detected):
        self.host_id = host_id
        self.ip_address = ip_address
        self.mac_address = mac_address
        self.description = description
        self.icon = icon
        self.manufacturer = manufacturer
        self.known = known
        self.first_detected = first_detected
        self.last_detected = last_detected


def get_hosts():
    db = mysql.connector.connect(**configs['mysql'])
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM hosts")
    result = cursor.fetchall()
    cursor.close()
    db.close()

    return [Host(host_id=r["id"], ip_address=r["ip_address"],
                 mac_address=r["mac_address"], description=r["description"],
                 icon=r["icon"], manufacturer=r["manufacturer"],
                 known=r["known"], first_detected=r["first_detected"],
                 last_detected=r["last_detected"]) for r in result]


@login_manager.user_loader
def load_user(user_id):
    return get_user(alternative_id=user_id)


@app.route("/favicon.ico")
def favicon():
    return send_file("static/img/icons/icon.ico")


@app.route("/manifest.json")
def manifest():
    return send_file("static/manifest.json")


@app.route("/")
@login_required
def index():
    return render_template("index.html", get_hosts=get_hosts)


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/api/login", methods=["POST"])
def login_user_api():
    username = request.json.get("username")
    password = request.json.get("password")
    if username is None or password is None:
        return {"status": "error", "error": "username_and_password_required"}

    user = get_user(username=username)

    if user is None:
        return {"status": "error", "error": "wrong_username_or_password"}
    if not user.check_password(password):
        return {"status": "error", "error": "wrong_username_or_password"}

    login_user(user, remember=True)

    return {"status": "ok"}


@app.route("/api/user", methods=["PUT"])
@login_required
def edit_current_user():
    username = request.json.get("username")
    email = request.json.get("email")

    if username is not None and username != current_user.username:
        if get_user(username=username) is None:
            current_user.change_username(username)
        else:
            return {"status": "error", "error": "username_taken"}

    if email is not None and email != current_user.email:
        current_user.change_email(email)

    return {"status": "ok"}


@app.route("/api/user/password", methods=["PUT"])
@login_required
def change_password():
    password = request.json.get("password")
    if password is None or password == "":
        return {"status": "error", "error": "password_required"}

    username = current_user.username
    current_user.change_password(password)
    login_user(get_user(username=username))

    return {"status": "ok"}


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.errorhandler(401)
def unauthorized(e):
    return redirect(url_for('login'))


if __name__ == "__main__":
    app.run(**configs["flask"])
