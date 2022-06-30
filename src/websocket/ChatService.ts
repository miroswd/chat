import { container } from "tsyringe";
import { io } from "../http";
import { CreateChatRoomService } from "../services/CreateChatRoomService";
import { CreateMessageService } from "../services/CreateMessageService";
import { CreateUserService } from "../services/CreateUserService";
import { GetAllUsersService } from "../services/GetAllUsersService";
import { GetChatRoomByIdService } from "../services/GetChatRoomByIdService";
import { GetChatRoomByUsersService } from "../services/GetChatRoomByUsersService";
import { GetMessagesByChatRoomService } from "../services/GetMessagesByChatRoomService";
import { GetUserBySocketIdService } from "../services/GetUserBySocketIdService";

io.on("connect", socket => {
  /**
   * socket.emit vs io.emit
   * 
   * io -> pra todos os usuários
   * socket -> controla pra quem enviar
   */

  // nome pro evento
  socket.emit("chat_iniciado", {
    message: "Seu chat foi iniciado"
  })

  // recebendo os dados de cadastro
  socket.on("start", async data => {

    const {email, avatar, name} = data;

    const createUserService = container.resolve(CreateUserService);


    const user = await createUserService.execute({
      name, email, avatar, socket_id: socket.id
    })

    // enviar informação pra todos os usuários, exceto pro q se logou
    socket.broadcast.emit("new_users", user);
  });

  socket.on("get_users", async (callback) => {
    const getAllUsersService = container.resolve(GetAllUsersService);

    const users = await getAllUsersService.execute();
    // não pode retornar direto users
    callback(users);
  });


  socket.on("start_chat", async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService);
    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    const getChatRoomByUsersService = container.resolve(GetChatRoomByUsersService);
    const getMessagesByChatRoomService = container.resolve(GetMessagesByChatRoomService);

    const userLogged = await getUserBySocketIdService.execute(socket.id);

    let room = await getChatRoomByUsersService.execute([
      data.idUser, userLogged._id
    ])

    if (!room) {
      room = await createChatRoomService.execute([data.idUser, userLogged._id])
    }

    socket.join(room.idChatRoom) // conectando os dois usuários na mesma sala 


    // recuperando msgs
    const messages = await getMessagesByChatRoomService.execute(room.idChatRoom)
    

    callback({room, messages});
  });


  socket.on("message", async data => {
    /**
     * - Buscar infos do user (socket.id)
     * - Salvar a msg
     * - Enviar a msg pra outro usuário da sala
     */

    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    const createMessageService = container.resolve(CreateMessageService);
    const getChatRoomByIdService = container.resolve(GetChatRoomByIdService);

    const user = await getUserBySocketIdService.execute(socket.id);

    const message = await createMessageService.execute({
      to: user._id,
      text:data.message,
      roomId: data.idChatRoom
    });

    io.to(data.idChatRoom).emit("message", {
      message, user
    }) // enviando pra todos os usuários conectados globalmente (usuários da sala)

    // enviando notificação 


    const room = await getChatRoomByIdService.execute(data.idChatRoom);
    const userFrom = room.idUsers.find(response => String(response._id) !== String(user._id));

    io.to(userFrom.socket_id).emit("notification", {
      newMessage: true,
      roomId: data.idChatRoom,
      from: user
    })
  })
})
