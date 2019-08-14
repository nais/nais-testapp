FROM mhart/alpine-node:base-9
MAINTAINER Johnny Horvi <johnny.horvi@nav.no> 

RUN apk add --no-cache curl

VOLUME /ephemeral
WORKDIR /src
COPY . .

EXPOSE 8080

CMD ["node", "./src/server.js"]
