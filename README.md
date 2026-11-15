1. Clone the Repo --
git clone https://github.com/yourusername/your-repo.git

2. npm install
(This recreates node_modules/ from package.json)

3. pip install flask pymongo flask-cors dnspython python-dotenv

4. Copy .env.example to .env and fill in your MongoDB URI, Google Maps key and Firebase config (never commit .env)

5. Run Both Servers --
Terminal 1 — Flask:
python app.py
Terminal 2 — Expo:
npm run web
