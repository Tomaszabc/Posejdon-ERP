Uproszczone uruchomienie aplikacji:
Zainstaluj aplikację Docker, zaktualizuj Windows Subsystem for Linux według wskazówek z Dockera.

Uruchom plik znajdujący się w folderze aplikacji:
warehouse_manager\start_eposejdon_windows.bat - dla Windows
warehouse_manager\start_eposejdon_mac_linux.sh - dla Linux/Mac

Do połączenia z bazą danych należy być zalogowanym do odpowiedniego firmowego WiFi. Baza danych Postgresql znajduje się na serwerze lokalnym który udostępnia ją do sieci firmowej.cd


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

Frontend to React. Backend Python. WebSockety - Redis.

