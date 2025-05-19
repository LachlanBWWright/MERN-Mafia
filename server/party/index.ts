import type * as Party from "partykit/server";

//this.room.getConnection(conn.id)?.send("hello from server");
export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    );

    // let's send a message to the connection
    conn.send("hello from server");
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    // as well as broadcast it to all the other connections in the room...
    this.room.broadcast(
      `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id],
    );
  }

  onClose(connection: Party.Connection): void | Promise<void> {
    // A websocket just disconnected!
    console.log(`Disconnected: ${connection.id}`);
    // let's broadcast the disconnection to all other connections in the room
    this.room.broadcast(`${connection.id} disconnected`, [connection.id]);
  }
}

Server satisfies Party.Worker;

/* 

export function addSocketListeners(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  roomSize: number,
) {
  io.on("connection", (socket: PlayerSocket) => {
    console.log("New Connection");
    //Handle players joining a room
    socket.on(
      "playerJoinRoom",
      async (captchaToken: string, cb: (code: string | number) => void) => {
        console.log("playerJoinRoom");
        try {
          let res = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?response=${captchaToken}&secret=${process.env.CAPTCHA_KEY}`,
          );
          if (res.data.success || process.env.debug === "true") {
            console.log("Captcha Success");
            //Blocks players from joining if ReCaptcha V3 score is too low, allows regardless if debug mode is on
            if (playRoom.current?.started || playRoom.current === undefined)
              playRoom.current = new Room(roomSize);
            console.log("playroomCurrent", playRoom.current);
            if (playRoom.current !== undefined) {
              socket.data.roomObject = playRoom.current;
              socket.join(playRoom.current.name); //Joins room, messages will be received accordingly
              let result = socket.data.roomObject.addPlayer(socket);
              console.log("Result: " + result);
              cb(result);
            }
          } else cb(2);
        } catch (error) {
          console.log("CatchTest: " + error);
          //cb(2); //If a room isn't found, socketio tries to callback null.
        }
      },
    );

    //Handles users disconnecting from a room
    socket.on("disconnect", () => {
      try {
        if (socket.data.roomObject !== undefined) {
          socket.data.roomObject.removePlayer(socket.id);
        }
      } catch (error) {
        console.log("Disconnect error: " + error);
      }
    });

    //Handle users sending a chat message to all other players
    socket.on("messageSentByUser", (message, isDay: boolean) => {
      try {
        if (message.length > 0 && message.length <= 150) {
          if (socket.data.roomObject !== undefined)
            socket.data.roomObject.handleSentMessage(socket, message, isDay);
        }
      } catch (error) {
        console.log(error);
      }
    });

    //Handles a player voting for another player - Recipient is the player's position in the array
    socket.on("handleVote", (recipient, isDay: boolean) => {
      try {
        if (typeof recipient === "number") {
          if (socket.data.roomObject !== undefined)
            socket.data.roomObject.handleVote(socket, recipient, isDay);
        }
      } catch (error) {
        console.log(error);
      }
    });

    //Handles a player visiting another player - Recipient is the player's position in the array
    socket.on("handleVisit", (recipient, isDay: boolean) => {
      try {
        if (typeof recipient === "number" || recipient === null) {
          if (socket.data.roomObject !== undefined)
            socket.data.roomObject.handleVisit(socket, recipient, isDay);
        }
      } catch (error) {
        console.log(error);
      }
    });

    //Handles a player whispering to another player - Recipient is the player's position in the array
    socket.on("handleWhisper", (recipient, message, isDay) => {
      try {
        if (
          typeof recipient === "number" &&
          message.length > 0 &&
          message.length <= 150
        ) {
          if (socket.data.roomObject !== undefined)
            socket.data.roomObject.handleWhisper(
              socket,
              recipient,
              message,
              isDay,
            );
        }
      } catch (error) {
        console.log(error);
      }
    });
  });
}

*/
