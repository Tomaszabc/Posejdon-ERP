Uruchomienie aplikacji:
W oddzielnych terminalach-

Backend Python/Django:
daphne -b 0.0.0.0 -p 8000 warehouse_manager.asgi:application

Żeby uruchomić projekt Backend trzeba zainstalować wtyczki z requirements:
pip install -r requirements.txt oraz brakujące pakiety typu django-jazzmin.

----------------------------

Frontend React:
npm start

----------------------------

Aplikacja nasłuchująca WebSocket'y (live chat):
docker run -p 6379:6379 redis

----------------------------


Formatowanie:
npx prettier --write .

Frontend to React. Backend Python.

