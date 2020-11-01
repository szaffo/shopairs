export default class SocketEventHandler {
  private io: SocketIO.Server;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.listen();
  }

  private listen(): void {
    this.io.on("connection", (socket: SocketIO.Socket) => {
      console.log(socket);
    });
  }
}
