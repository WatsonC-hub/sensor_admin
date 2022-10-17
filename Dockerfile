FROM node:16-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/
RUN npm run build

#production
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx","-g","daemon off;"]