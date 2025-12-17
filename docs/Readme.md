#  Library Server API

![Node.js](https://img.shields.io/badge/node-%3E=18-green)
![MongoDB](https://img.shields.io/badge/db-mongodb-green)
![License](https://img.shields.io/badge/license-MIT-blue)

REST API for library enterprise: user's accounts, roles, books and book's pick/return operations.

Project use:

- JWT - authentication
- Base login/password authentication
- RBAC (role-based access control)
- MongoDB through Mongoose
- SQL
- JSON-based local data storage
- middleware-pipline Express

---

##  Features

-  JWT authentication
-  Role-based authorization
-  Book management (CRUD and pick/return)
-  Account management
-  Joi validation
-  Request rate limiting
-  Centralized error handling

---
##  Quick Start

```bash
git clone https://github.com/Duegen/libraryServer.git
cd libraryServer
npm install
npm run start
```

Server URL:

```
http://localhost:3050
```

---

## ️ Configuration
### Environment variables (`.env`)
```env
#============Mongo Credentials=======
MONGO_CLUSTER="mongodb+srv://<user>:<password>@cluster0.p1mqnme.mongodb.net/"
MONGO_DATABASE=libraryServer
BOOKS_MONGO_COLLECTION=Books
ACCOUNTS_MONGO_COLLECTION=Accounts
#============SQL Credentials=========
SQL_HOST=localhost
SQL_PORT=3306
SQL_USER=root
SQL_PASSWORD=
SQL_DB_NAME=libraryServer
#============JSON DB Credentials=====
JSON_DB_NAME=libraryServer
#============Supervisor==============
OWNER = 100000000
OWNER_PASS=qwerty
#============JWT=====================
JWT_SECRET=super-extra-secret-key-for-jwt
JWT_EXP=1h
```

### App config (`lib-config.json`)
```json
{
  "port": 3050,
  "database_mode": "Mongo",
  "skipRoutesArr": [
    "POST/account",
    "POST/account/login",
    "GET/docs"
  ],
  "selfRoutesArr": [
    "GET/account/byId",
    "PATCH/account/password",
    "PATCH/account/update"
  ],
  "default_roles": ["reader", "user"],
  "supervisor_roles": ["supervisor", "premium_user"],
  "supervisor_access": 99,
  "access_roles": {
    "admin": 3,
    "reader": 1,
    "librarian": 2
  },
  "status_roles": {
    "user": 5,
    "premium_user": -1
  },
  "default_rate_limit": 60,
  "anonymous_rate_limit": 20,
  "get_books_info_level": 2,
  "reader_roles": ["reader"],
  "pathRoles": {
    "GET/account/byId": ["admin", "supervisor", "librarian"],
    "DELETE/account": ["admin", "supervisor"],
    "PATCH/account/update": ["admin", "supervisor"],
    "PATCH/account/roles": ["admin", "supervisor"],
    "GET/api/books": ["reader", "librarian"],
    "GET/api/books/genres/": ["reader", "librarian"],
    "GET/api/books/authors/": ["reader", "librarian"],
    "POST/api/books": ["librarian"],
    "DELETE/api/books": ["librarian"],
    "PATCH/api/books": ["librarian"],
    "PATCH/api/books/restore": ["librarian"],
    "PATCH/api/books/pick": ["librarian"],
    "PATCH/api/books/return": ["librarian"],
    "GET/api/logger": ["admin", "supervisor"],
    "GET/api/logger/dates": ["admin", "supervisor"]
  }
}
```
---

## Authentication

---

##  Roles & Permissions
Roles, permissions and excess levels are tuned in `lib-config.json` [link](#app-config-lib-configjson).\
Example table of roles and permissions:

| Role       | Permissions                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| reader     | view books, view own account                                                                |
| librarian  | manage books, view accounts with the same level excess or below                             |
| admin      | edit/remove accounts with lower level excess, set roles of accounts with lower level excess |
| supervisor | full access                                                                                 |

---

## API
All libraryServer API information is published as a 
- [postman collection](https://documenter.getpostman.com/view/49500476/2sB3dVNTGT)
- [swagger](http://localhost:3050/docs)
### Account API
- `POST /account` create an account
- `POST /account/login` login using basic authorization and get JWT token
- `GET /account/byId?userId=123456789` get account information by account id
- `DELETE /account?userId=123456789` delete account by account id
- `PATCH /account/password` change account password
- `PATCH /account/update?userId=123456789` update account info by account id
- `PATCH /account/roles?userId=123456789` set account roles by account id
### Book API
- `POST /api/books` add a book to database
- `GET /api/books` get all books
- `GET /api/books/genres/:genre` get books by genre
- `GET /api/books/authors/:author` get books by author
- `DELETE /api/books?bookId=some_book_id` delete book or mark as removed by book id
- `PATCH /api/books?bookId=some_book_id` edit book info by book id
- `PATCH /api/books/restore?bookId=some_book_id` unmark book as removed by book id
- `PATCH /api/books/pick?bookId=some_book_id&readerId=123456789` pick book by book id and reader id
- `PATCH /api/books/return?bookId=some_book_id` return book by book id
### Logger API
- `GET /api/logger` get the last log file
- `GET /api/logger/dates?date=01.01.2025` get the log file for certain date

---

## Project Structure

```
src/
 ├── configuration/
 ├── controllers/
 ├── database/
 ├── errorHandler/
 ├── joi/
 ├── middleware/
 ├── model/
 ├── routers/
 ├── service/
 ├── utils/
 ├── winston/
 ├── app.ts
 └── server.ts
```
---
## License



---

## Author

Backend API project for learning purposes. Nikita Diugurov (Group 28-31Java) (Haifa)