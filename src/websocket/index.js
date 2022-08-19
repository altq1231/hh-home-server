const {
  Server
} = require("socket.io");
const ip = require("ip");
const port = process.env.PORT || 3301;

const baseUrl = `http://${ip.address()}:${port}`;

function getItemIndex(arr, key) {
  let temp = null
  arr.map((item, index) => {
    if (item.id === key) {
      temp = index
    }
  })
  return temp
}

function removeSameItemConcat(arr, data) {
  const userIndex = getItemIndex(arr, data.id)

  if (userIndex && userIndex >= 0) {
    arr[userIndex] = data
  } else {
    arr.push(data)
  }

  return arr
}

module.exports = (httpServer) => {
  const wss = new Server(httpServer, {
    path: "/wss",
  });
  let userList = [];
  let chatGroupList = {};


  wss.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("open", "sssssss");
    socket.on('login', (userInfo) => {
      userList = removeSameItemConcat(userList, userInfo)

      console.log(userList, userInfo);
      wss.emit('userList', userList);
      // socket.emit(给该socket的客户端发送消息) + socket.broadcast.emit(发给所以客户端，不包括自己)  = wss.emit(给所有客户端广播消息)
    })

    socket.on("sendMsg", (data) => {
      console.log(data);
      // wss.to(data.id).emit('receiveMsg', data)
      socket.to(data.id).emit('receiveMsg', data)
    });

    socket.on('sendMsgGroup', (data) => {
      // wss.to(data.roomId).emit('receiveMsgGroup', data);
      socket.to(data.roomId).emit('receiveMsgGroup', data);
    })

    // 创建群聊
    socket.on('createChatGroup', data => {
      socket.join(data.roomId);

      chatGroupList[data.roomId] = data;
      data.member.forEach(item => {
        wss.to(item.id).emit('chatGroupList', data)
        wss.to(item.id).emit('createChatGroup', data)
        // socket.to 本人没有收到
        // wss.to 所有人都收到了
      });
    })

    // 加入群聊
    socket.on('joinChatGroup', data => {
      socket.join(data.info.roomId);
      wss.to(data.info.roomId).emit('chatGrSystemNotice', {
        roomId: data.info.roomId,
        msg: data.userName + '加入了群聊!',
        system: true
      }); //为房间中的所有的socket发送消息, 包括自己
    })

    // 退出群聊
    socket.on('leave', data => {
      socket.leave(data.roomId, () => {
        let member = chatGroupList[data.roomId].member;
        let i = -1;
        member.forEach((item, index) => {
          if (item.id === socket.id) {
            i = index;
          }
          wss.to(item.id).emit('leaveChatGroup', {
            id: socket.id, // 退出群聊人的id
            roomId: data.roomId,
            msg: data.userName + '离开了群聊!',
            system: true
          })
        });
        if (i !== -1) {
          member.splice(i)
        }
      });
    })


    socket.on("disconnect", () => {
      chatGroupList = {};
      userList = userList.filter(item => item.id != socket.id)
      console.log("a user disconnected", userList);
      wss.emit('quit', socket.id)
    });
  });
}