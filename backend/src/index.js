const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const cors = require('cors')

const routes = require('./routes')
const {setupWebsocket} = require('./websocket')


const app = express();
const server = http.Server(app)

setupWebsocket(server)

mongoose.connect('mongodb+srv://phil:pmgs2104@cluster0-wxhk9.mongodb.net/omnistak10?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
})
app.use(cors())
app.use(express.json());

//Metodos HTTP: GET,  POST, PUT, DELETE

//Tipos de Parâmetros

//Query Params:request.query(filtros ordenação, paginação, ...)
//Route Params:request.params(identificar)
//Body:request.body(Dados para criação ou alteração de um registro)

app.use(routes)
server.listen(3333);