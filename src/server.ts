import { server } from "./http"

import "./websocket/ChatService"

server.listen(3001, () => {
  console.log('server running at 3001')
})