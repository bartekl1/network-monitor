from flask import Flask, render_template, send_file

import json

with open("configs.json") as file:
    configs = json.load(file)

app = Flask(__name__)


@app.route("/favicon.ico")
def favicon():
    return send_file("static/img/icons/icon.ico")


@app.route("/manifest.json")
def manifest():
    return send_file("static/manifest.json")


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(**configs["flask"])
