FROM navikt/node-express:test
LABEL maintainer="https://nais.io"

RUN apk add --no-cache curl

WORKDIR /src
COPY . .

EXPOSE 8080

CMD ["node", "./src/server.js"]
