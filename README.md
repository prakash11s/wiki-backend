# Odessey Backend

Library Management WebApp


### Prerequisites

To run locally:

* Make sure you have installed nodeJS.
* Make sure you have installed and run mySQL server.
* Create database with the name same as in config.json file.


## Getting Started

- To install all the modules, run the following command:

     `npm install`

 - To start, just run the following command:

	`npm start`


## Running the tests

- To test, run the following command:

	`npm run test`


## Migrate and seeding to database commands examples

init setup

```
npx sequelize-cli init

```

Model + Migration file

```
    npx sequelize-cli model:generate --name admin_login_token --attributes firstName:string,lastName:string,email:string
```

Migration file generate

```
    npx sequelize-cli migration:generate --name user_device_token

```

Migration run

```
    npx sequelize-cli db:migrate
```

Create Seeder

```
    npx sequelize-cli seed:generate --name countrySeeder
```

Run Seeder

```
    npx sequelize-cli db:seed:all 
                OR

    npx sequelize-cli db:seed --seed src/seeders/20200901094921-countrySeeder.js
    npx sequelize-cli db:seed --seed src/seeders/20200903070150-faqSeeder.js

```

Undo all seeding

```
    npx sequelize-cli db:seed:undo:all

```

remigrate

```
  sequelize db:migrate:undo:all
  sequelize db:migrate

```

## Deployment

```
```

## For API Testing

```
```

#### Latest PostMan Collection link for APIs :

https://www.getpostman.com/collections/3f8451bd6eca8d1e856c

## Built With

* [Node](https://nodejs.org/) - JavaScript runtime built on Chrome's V8 JavaScript engine
* [Express](https://expressjs.com/) - A minimal and flexible Node.js web application framework.

## Authors

zyKx

## License



