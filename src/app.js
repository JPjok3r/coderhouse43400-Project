import express from "express";
import config from "./config.js";
import "./DAO/db/dbConfig.js";
import cookieParser from 'cookie-parser';
import productRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import usersRouter from "./routes/users.router.js";
import sessionRouter from "./routes/sessions.router.js";
import viewsRouter from "./routes/views.router.js";
import mockingProductsRouter from './routes/mocking.router.js';
import loggerTest from './routes/loggerTest.router.js';
import { errorMiddleware } from './errors/error.middleware.js';
import handlebars from 'express-handlebars';
import { Server } from "socket.io";
import { __dirname } from "./utils/utils.js";
import { chatMongo } from "./DAO/managers/ChatMongo.js";  //Va a cambiar
import session from 'express-session';
import mongoStore from 'connect-mongo';
import passport from 'passport';
import './services/passport/passportStrategies.js'
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//cookies
app.use(cookieParser('secretKeyCookies'))

//Sessions
app.use(session({
  store: new mongoStore({
    mongoUrl: config.mongo_uri,
    ttl : 60*10
  }),
  secret: 'secretSession',
  //cookie: {maxAge: 60000},
  resave: false,
  saveUninitialized: false
}));

//Passport
app.use(passport.initialize());

//Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'E-commerce Proyecto CoderHouse',
      description: 'API desarrollada como proyecto de CoderHouse para un E-commerce'
    }
  },
  apis: [`${__dirname}/docs/**/*.yaml`]
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

//Routes
app.use("/api/products", productRouter);
app.use("/api/carts", cartsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionRouter);
app.use('/', viewsRouter);
app.use('/mockingproducts', mockingProductsRouter);
app.use('/loggerTest', loggerTest);

app.use(errorMiddleware);

const httpServer = app.listen(config.port, () => {
  console.log(`Servidor en linea, escuchando en: ${config.port}`);
  console.log('http://localhost:8080');
});

const socketServer = new Server(httpServer);

socketServer.on('connection',socket=>{
   console.log(`Usuario conectado: ${socket.id}`);

   socket.on('disconnect',()=>{
       console.log(`Usuario desconectado: ${socket.id}`);
   })

   socket.on('mensaje',async infoMensaje=>{
       await chatMongo.createOne(infoMensaje)
       const messages = await chatMongo.getAll();
       socketServer.emit('chat', messages)
   })
   socket.on('usuarioNuevo',usuario=>{
     socket.broadcast.emit('broadcast',usuario)  
   })

})