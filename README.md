Frontend to React. Backend Python.

Żeby uruchomić projekt Backend trzeba zainstalować wtyczki z requirements:
pip install -r requirements.txt

Oraz wszystko czego brakuje w requirements ale wymaga tego aplikacja.

Potem tworzenie bazy:
python manage.py migrate

Uruchomienie serwera:
python manage.py runserver

`http://127.0.0.1:8000/`

Polecenie na tworzenie superusera lokalnie:

python manage.py createsuperuser

Następnie instalacja paczek React:
npm install lub yarn install

Uruchomienie:
npm start

http://localhost:3000


Backend oraz Frontend musi być uruchomiony w jednym czasie.

# Warehouse Manager

## Overview
The Warehouse Manager is a Django-based web application designed to help manage inventory in a warehouse. It provides an intuitive interface for tracking stock levels, managing orders, and generating reports.

## Features
- User-friendly interface for inventory management
- Navigation bar for easy access to different sections
- Ability to add, update, and delete inventory items
- View stock levels and order history

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd warehouse_manager
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```
   python manage.py migrate
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

6. Access the application at `http://127.0.0.1:8000/`.

## Usage
- Navigate through the application using the navigation bar.
- Manage inventory items by adding, editing, or deleting them.
- Monitor stock levels and generate necessary reports.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.