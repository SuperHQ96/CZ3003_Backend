FROM node:10

# set app working directory
# WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

# insatall dependencies
RUN npm install

# Fix vulnerabilities
RUN npm audit fix

# copy all files into container
# COPY . . 
COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "start"]