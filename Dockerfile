FROM mhart/alpine-node:10

RUN apk add --no-cache curl

VOLUME /ephemeral
WORKDIR /src
COPY . .

EXPOSE 8080

CMD ["node", "./src/server.js"]
