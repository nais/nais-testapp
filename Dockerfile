FROM docker.adeo.no:5000/alpine-node:base-6.9
MAINTAINER Johnny Horvi <johnny.horvi@gmail.com> 

WORKDIR /src
COPY . .

EXPOSE 80

CMD ["node", "./src/server.js"]
