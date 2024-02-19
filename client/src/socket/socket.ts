import { Socket, io } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../../../servers/socket";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io("/");
