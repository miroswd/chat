import 'reflect-metadata'
import express from 'express';
import path from 'path';
import {createServer} from 'http';
import {Server} from 'socket.io'

import mongoose from 'mongoose';


const app =express();
app.use(express.static(path.join(__dirname, '..', 'public')))

const server = createServer(app);

mongoose.connect("mongodb://localhost/rocketsocket")
const io = new Server(server);

/**
 * io -> conexão global, todo cliente que se conectar na aplicação
 * vai passar por esse io
 * 
 * esse io em específico é a inicialização, mas como estamos exportando, podemos recoperar
 * o parâmetro em outra chamada de io, mas utilizando o connect
 */
io.on("connection", (socket) => {
  console.log(`Connected user: `, socket.id)
})

app.get('/hi', (req, res) => {
  return res.status(200).json({
    hi: "miro"
  })
})


export {server, io};