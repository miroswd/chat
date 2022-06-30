import { ObjectId } from "mongoose";
import { injectable } from "tsyringe";
import { ChatRoom } from "../schemas/Chatroom";



@injectable()
class GetChatRoomByUsersService {
  async execute(idUsers: ObjectId[]){
    const room = await ChatRoom.findOne({
      idUsers: {
        $all: idUsers // match com todos os valores, não um ou outro
      }
    }).exec()

    return room;
  }
}

export { GetChatRoomByUsersService }