import http from "http";
import socketIO from "socket.io";
import SocketEventHandler from "./utils/SocketEventHandler";
import DatabaseHandler from "./utils/DatabaseHandler";

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
db.createNewPair('teszter3@eszter.com', 'pawSword').then((pair) => {
  console.log(pair)
})

// hashPassword('titkosbéla').then((hash) => {
//   console.log(hash)

//   comparePassword('titkosbéla', hash).then((succes) => {
//     console.log(succes)
//   })
// })