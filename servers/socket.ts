import { Server } from "socket.io";
import axios from "axios";
import { httpServer } from "./httpServer";
import Room from "../model/rooms/room";

export interface ClientToServerEvents {
  playerJoinRoom: (
    captchaToken: string,
    cb: (result: number) => void,
  ) => Promise<void>;
  disconnect: () => void;
  messageSentByUser: (message: string, isDay: boolean) => void;
  handleVote: (recipient: number, isDay: boolean) => void;
  handleVisit: (recipient: number | null, isDay: boolean) => void;
  handleWhisper: (recipient: number, message: string, isDay: boolean) => void;
}

export interface ServerToClientEvents {}

export interface InterServerEvents {}

export interface SocketData {
  roomObject: Room;
}

export const io = new Server<
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const playRoom: { current: Room | undefined } = {
  current: undefined,
};

export function addSocketListeners(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  roomSize: number,
) {
  io.on("connection", (socket) => {
    //Handle players joining a room
    socket.on("playerJoinRoom", async (captchaToken: string, cb: any) => {
      try {
        let res = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?response=${captchaToken}&secret=${process.env.CAPTCHA_KEY}`,
        );
        if (res.data.success || process.env.debug === "true") {
          //Blocks players from joining if ReCaptcha V3 score is too low, allows anyway if debug mode is on
          if (playRoom.current?.started) playRoom.current = new Room(roomSize);
          if (playRoom.current !== undefined) {
            socket.data.roomObject = playRoom.current;
            socket.join(playRoom.current.name); //Joins room, messages will be received accordingly
            let result = socket.data.roomObject.addPlayer(socket);
            cb(result);
          }
        } else cb(2);
      } catch (error) {
        console.log("CatchTest: " + error);
        //cb(2); //If a room isn't found, socketio tries to callback null.
      }
    });

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
    socket.on("handleWhisper", (recipient, message: string, isDay: boolean) => {
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
