import http from "http";
import socketIO from "socket.io";
import SocketEventHandler from "./utils/SocketEventHandler";
import DatabaseHandler, { DatabaseError } from "./utils/DatabaseHandler";
import { exit } from "process";

const port: number = 3000;

class Server {
  private server: http.Server;
  private port: number;

  constructor(port: number, databaseHandler: DatabaseHandler) {
    this.port = port;
    this.server = new http.Server();

    new SocketEventHandler(socketIO(this.server), databaseHandler);
  }

  public start() {
    this.server.listen(this.port, () =>
      console.log(`Server listening on port ${this.port}.`)
    );
  }
}

new Server(port, new DatabaseHandler()).start();
// const db = new DatabaseHandler()
// db.registerUser('test@teszter.hu', 'admin', 'TEszt BÉla').then((some) => console.log(some))
// db.authenticateUser('test@teszter.hu', 'admin').then((some) => console.log(some))