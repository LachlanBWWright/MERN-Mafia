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
