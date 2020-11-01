import http from "http";
import socketIO from "socket.io";
import SocketEventHandler from "./utils/SocketEventHandler";
import DatabaseHandler, { DatabaseError } from "./utils/DatabaseHandler";
import { exit } from "process";

const port: number = 3000;

class Server {
  private server: http.Server;
  private port: number;

  constructor(port: number) {
    this.port = port;
    this.server = new http.Server();

    new SocketEventHandler(socketIO(this.server));
  }

  public start() {
    this.server.listen(this.port, () =>
      console.log(`Server listening on port ${this.port}.`)
    );
  }
}

new Server(port).start();
const db = new DatabaseHandler()
