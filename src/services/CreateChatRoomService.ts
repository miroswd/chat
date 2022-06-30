import { ObjectId } from "mongoose";
import { injectable } from "tsyringe";
import { ChatRoom } from "../schemas/Chatroom";


@injectable()
class CreateChatRoomService {
  async execute(idUsers: any[]){
    const room = await ChatRoom.create({
      idUsers
    })

    return room;
  }
}





export { CreateChatRoomService }