from flask import Flask, render_template, request, redirect, session, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
import google.generativeai as genai
import os

app = Flask(__name__)
app.secret_key = "da3df5157bdcdc2934ceebd411187af1"

# --- Gemini API Setup ---
API_KEY = "AIzaSyCI7Du0Eyg5bHSGTdyqTboJAZ-ETmduIWY"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# --- Database Setup ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

# --- User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

# --- Routes ---
@app.route('/')
def index():
    return redirect(url_for('signup'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return render_template('signup.html', error="User already exists.")
        new_user = User(email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        session['user'] = email
        print("✅ Signup Successful")
        return redirect(url_for('chat'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email, password=password).first()
        if user:
            session['user'] = user.email
            print("✅ Login Successful")
            return redirect(url_for('chat'))
        else:
            return render_template('login.html', error="Invalid credentials.")
    return render_template('login.html')

@app.route('/ChatBox')
def chat():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('ChatBox.html')

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    prompt = data.get("prompt")
    try:
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Creates the users.db with User table if not exists
    app.run(debug=True)
