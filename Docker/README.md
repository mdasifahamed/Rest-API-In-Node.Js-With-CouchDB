# Dokcer Configuration For This App

Docker and Docker Compose Must Be Insatlled On The Host

## Step To Be Followed For Containerize The App
### important Note: Before following these steps, you'll need to update the database URL in your `app.j`s file.

In the local environment, the application likely uses the same machine for both the app and the database. However, when containerized with Docker, the application runs in its own container, and the database resides in a separate container. Therefore, you need to update the URL to reference the database container's service name (`couchdb`) defined in  `docker-compose.yaml` file.

- Create images both for the couchdb and the node app
For Creating Dokcer Image For CouchDB a Docker File is Provided Here  at `./Docker/db/Dockerfile`

At first create a vloume in the docker host 

```javascript
    docker volume create couchdb_for_node_app
```
then build the image by the  following command

```javascript
    docker build -t couchdb_for_node:2.0 -f ./Dokcer/db/Dokcerfile .
```
then run image by the following command binidng the volume

```javascript
    docker run -v couchdb_for_node_app:/opt/couchdb/data/ couchdb_for_node:2.0
```
Note: At first run the couchdb image throw an error that `_user` db is found we have create the `_user` to Solve this issue follow the below steps

Open another terminal and get the container id of the `couchdb_for_node:2.0` using

```javascript
    docker ps -a
```
Then type following it will create a interactive terminal inside the docker container
```javascript
   docker exec -it <CONTAINER_ID_OF_couchdb_for_node:2.0>
```
Inside the container terminal create the `_user` db

```javascript
   curl -X PUT http://admin:admin@localhost/_user
```

We also need another database for the app which is `resapi` you can find it in the `app.js`

To craete another database again type the following inside coushdb terminal

```javascript
   curl -X PUT http://admin:admin@localhost/resapi
```
close the interactive shell typing `exit`

re run the couchdb image the error should be gone.

- Now create the app image of our 
A dokcerfile is provied inside the `./Docker/web/Dockerfile` for the app

from the terminal type the following to create image for the app localy

```javascript
   docker build -t  node-couch-db:3.0 -f ./Docker/web/Dockerfile .
```
- Create a docker network so that the app and db can communicate with each other

To create a docker network use the following command

```javascript
   docker network create app_to_db
```
Use this network `app_to_db` on docker compose file

To run app from the app use the following command (A docker compose i provided where all the setup is provided how spin the the app)

```javascript
    docker-compose up
```

type `CLTR+C` to stop the app and to stop the containter type `docker-compose down`



