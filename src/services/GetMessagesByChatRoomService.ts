import {  injectable } from "tsyringe";
import { Message } from "../schemas/Message";


@injectable()
class GetMessagesByChatRoomService {
  async execute(roomId: string) {
    const messages = await Message.find({
      roomId
    }).populate("to").exec();

    // populate -> pega as informações do usuário
    return messages;
  }
}

export { GetMessagesByChatRoomService }