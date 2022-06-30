const socket = io("http://localhost:3001");
let idChatRoom = ``;
// evento que vamos ficar escutando
socket.on("chat_iniciado", data => {
  console.log(data)
});



const onLoad = async () => {
  const urlParams = new URLSearchParams(window.location.search)

  const name = urlParams.get("name");
  const email = urlParams.get("email");
  const avatar = urlParams.get("avatar");



  document.querySelector(".user_logged").innerHTML += `
  <img
  class="avatar_user_logged"
  src="${avatar}"
  />
  <strong id="user_logged">${name}</strong> 
  `

  socket.emit("start", { name, email, avatar })

  socket.on("new_users", user => {
    const existsInDiv = document.getElementById(`user_${user._id}`)

    if (!existsInDiv) {
      addUser(user)
    }
  })

  socket.emit("get_users", users => {
    users.map(user => {
      if (user.email !== email) {
        addUser(user)
      }

    })
  })
}


const addUser = (user) => {
  const userList = document.getElementById('users_list');
  userList.innerHTML += `
  <li
                class="user_name_list"
                id="user_${user._id}"
                idUser="${user._id}"
              >
                <img
                  class="nav_avatar"
                  src="${user.avatar}"
                />
                ${user.name}
              </li> 
  `
}

const addMessage = data => {
  const divMessageUser = document.getElementById("message_user");

  divMessageUser.innerHTML += `
   <span class="user_name user_name_date">
              <img
                class="img_user"
                src="${data.user.avatar}"
              />
              <strong>${data.user.name} &nbsp;</strong>
              <span>${dayjs(data.message.created_at).format("HH:mm")}</span></span
            > 
            <div class="messages">
              <span class="chat_message">${data.message.text}</span>
            </div>
   `
}

document.getElementById("users_list").addEventListener("click", e => {

  const inputMessage = document.getElementById("user_message");
  inputMessage.classList.remove("hidden")

  document.getElementById("message_user").innerHTML = "";

  document.querySelectorAll("li.user_name_list").forEach(item => item.classList.remove("user_in_focus"))

  if (e.target && e.target.matches("li.user_name_list")) {
    const idUser = e.target.getAttribute("idUser");



    e.target.classList.add("user_in_focus")

    const notification = document.querySelector(`#user_${idUser} .notification`)
    notification && notification.remove()


    socket.emit("start_chat", { idUser }, response => {
      idChatRoom = response.room.idChatRoom;

      console.log({ response: response.messages })
      response.messages.forEach(message => {

        console.log(message)

        const data = {
          message,
          user: message.to
        }

        addMessage(data)
      })
    })


  }

})



document.getElementById("user_message").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const message = e.target.value;
    e.target.value = '';


    const data = {
      message, idChatRoom
    }

    console.log({ data_fora: data })
    socket.emit("message", data);

    socket.on("message", data => {
      if (data.message.roomId === idChatRoom) {
        let messages = [];
        messages.push(data)
        addMessage(...[...new Set(messages)])
      }
    });

    socket.on("notification", data => {
      if (data.roomId !== idChatRoom) {
        const user = document.getElementById(`user_${data.from._id}`);

        user.insertAdjacentHTML("afterbegin", `
        <div class="notification"></div>
      `)
      }
    })
  }
})




onLoad();


