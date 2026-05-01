# node-civ

## Description

Basic NodeJS app that uses ExpressJS to expose REST endpoints to retrieve, save new, update and delete civ data in a MongoDB database.

## To start

- npm start -> start the application
- npm run dev -> run application in dev mode, i.e. with nodemon

## Docker

### Build the image

```bash
docker build -t node-civ-mongodb .
```

### Run the container

```bash
docker run --rm -p 3000:3000 --env ATLAS_URI="your-mongodb-uri" node-civ-mongodb
```

### Run on a custom port

```bash
docker run --rm -p 8080:8080 --env PORT=8080 --env ATLAS_URI="your-mongodb-uri" node-civ-mongodb
```

Notes:
- The app uses `ATLAS_URI` for MongoDB and defaults to `mongodb://localhost:27017` if not provided.
- The app uses `PORT` and defaults to `3000` if not provided.

## MongoDB



## Technologies used

- NodeJS
- ExpressJS
- MongoDB
- nodemon -> restarts application automatically after making code changes
- joi -> package used for validating input data
- dotenv -> package used create / store environment variables in a .env file which is then loaded into the global envs
