import DatabaseHandler, { DatabaseError, DatabaseErrorMessage, UserData } from "./DatabaseHandler";

export default class SocketEventHandler {
  private io: SocketIO.Server
  private dbh: DatabaseHandler
  private handleMap: HandleMapType

  constructor(io: SocketIO.Server, databaseHandler: DatabaseHandler) {
    this.io = io
    this.dbh = databaseHandler
    // This table shows which function janldes which event. The dataFilter is a function that filters the args for the handler
    this.handleMap = {
      // createNewPair: { function: this.dbh.createNewPair, dataFilter: (data) => [data.token] }, // Pairs should already exists after register
      getLists: { function: this.dbh.getLists, dataFilter: (data) => [data.token] },
      getUserData: { function: this.dbh.getUser, dataFilter: (data) => [data.token] },
      register: { function: this.dbh.registerUser, dataFilter: (data) => [data.token, data.name] }, // This should create the new user in the database with a pair
      joinToPair: { function: this.dbh.joinToPair, dataFilter: (data) => [data.token, data.connectionCode] },
      deletePair: { function: this.dbh.deletePair, dataFilter: (data) => [data.token] }, // we should focus on this later
      createList: { function: this.dbh.createList, dataFilter: (data) => [data.token, data.name] },
      addItem: { function: this.dbh.addItemToList, dataFilter: (data) => [data.token, data.listId, data.itemName, data.quantity] },
      deleteList: { function: this.dbh.deleteList, dataFilter: (data) => [data.token, data.listId] },
      renameList: { function: this.dbh.renameList, dataFilter: (data) => [data.token, data.listId, data.listName] },
      deleteItem: { function: this.dbh.deleteItem, dataFilter: (data) => [data.token, data.itemId] },
    }
    this.listen()
  }

  /**
   * Listening for new connections and register event listeners to them
   */
  private listen(): void {
    this.io.on("connection", (socket: SocketIO.Socket) => {
      this.registerHandlers(socket)
    });
  }

  /**
   * Registers events to thew socket
   */
  private registerHandlers(socket: SocketIO.Socket) {
    for (let event in this.handleMap) {
      const record: HandleMapRecord = this.handleMap[event]
      socket.on(event, (data: string) => {
        const request: SocketRequest = {
          rawData: data,
          event: event,
          mappedFunction: record.function,
          dataFilter: record.dataFilter,
          socket: socket,
          data: this.safeParse(data)
        }

        this.process(request)
      })
    }
  }

  /**
   * Parse suspicious inputs safely
   */
  private safeParse(rawData: string) {
    try {
      return JSON.parse(rawData)
    } catch (error) {
      return {}
    }
  }

  /**
   * Process the request
   */
  private async process(request: SocketRequest) {
    request.mappedFunction = (Object.keys(request.data).length > 0) ? request.mappedFunction.bind(this.dbh) : () => new DatabaseError("No or badly formatted data")
    console.log('Data from socket:', request.data)
    const result = await this.serve(request)
    console.log('Result after handler:', result) // TODO add to logger
  }

  /**
   * Serve the request. Sends back some data
   */
  private async serve(request: SocketRequest) {
    request.socket.emit(request.event, await this.response(request.mappedFunction, request.dataFilter(request.data)))
    // TODO after serve, sync the other user of the pair, if connected (butler?)
  }

  /**
   * Creates a response object safely. Catches every error 
   */
  private async response(func: CallableFunction, args: any[]) {
    try {
      return this.packResponse(await func(...args))
    } catch (error) {
      return this.packResponse(error)
    }
  }

  /**
   * Packs data into response
   */
  private packResponse(result: Error): FailedSocketResponse;
  private packResponse(result: UserData): SuccessfullSocketResponse;
  private packResponse(result: UserData | Error): SuccessfullSocketResponse | FailedSocketResponse {
    if (result instanceof Error) {
      return {
        success: false,
        error: (result instanceof DatabaseError) ? result.definition() : result.message,
        origin: (result instanceof DatabaseError) ? 'DatabaseHandler' : 'EventHandler'
      }
    } else {
      return {
        success: true,
        data: result
      }
    }
  }

}

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */
type SocketInput = {
  password: string,
  email: string,
  name: string,
  listName: string,
  connectionCode: string,
  listId: number
  itemName: string,
  quantity: number,
  itemId: number,
  token: string
}

type SuccessfullSocketResponse = {
  success: true,
  data: any
}

type FailedSocketResponse = {
  success: false,
  error: DatabaseErrorMessage,
  origin: 'DatabaseHandler' | 'EventHandler'
}

type HandleMapType = {
  [key in string]: HandleMapRecord
};

type HandleMapRecord = {
  function: CallableFunction,
  dataFilter: DataFilterType
}

type DataFilterType = (data: SocketInput) => (string | null | number)[]

type SocketEvent = 'login' | 'createNewPair'

type SocketRequest = {
  data: SocketInput,
  rawData: string,
  event: SocketEvent | string
  mappedFunction: CallableFunction,
  dataFilter: DataFilterType,
  socket: SocketIO.Socket
}