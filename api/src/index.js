require('dotenv').config({ path: __dirname + '/.env' });
const jwt = require('jsonwebtoken');
const db = require('./db');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const resolvers = require('./resolvers');
const models = require('./models');

const app = express();
const port = process.env.PORT || 4000;
const typeDefs = require('./schema');
const DB_HOST = process.env.DB_HOST;

// Подключаем БД
db.connect(DB_HOST);

// Получаем информацию пользователя из jwt
const getUser = token => {
  if (token) {
    try {
      // Возвращаем информацию пользователя из токена
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Если с токеном возникли проблемы выбросить ошибку
      throw new Error('Session invalid');
    }
  }
};

// Настройка Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Получаем токен пользователя из заголовка
    const token = req.headers.authorization;
    // Пытаемся извлеч пользователя с помощю токена
    const user = getUser(token);
    // Вывод информации о пользователе в консоль
    console.log(user);
    // Добавление моделей БД в контекст
    return { models, user };
  }
});

// Применяем промежуточное ПО Apollo Graph QL и указываем путь к /api
server.applyMiddleware({ app, path: '/api' });

app.listen({ port }, () => {
  console.log(
    `Graph QL server running at http://localhost:${port}${server.graphqlPath}`
  );
});
