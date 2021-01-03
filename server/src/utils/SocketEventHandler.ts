import DatabaseHandler, { DatabaseError, DatabaseErrorMessage, UserData } from "./DatabaseHandler";
import { validateToken } from "./validation";

export default class SocketEventHandler {
  private io: SocketIO.Server
  private dbh: DatabaseHandler
  private handleMap: HandleMapType

  constructor(io: SocketIO.Server, databaseHandler: DatabaseHandler) {
    this.io = io
    this.dbh = databaseHandler
    // This table shows which function hanldes which event. The dataFilter is a function that filters the arguments for the handler
    this.handleMap = {
      register: { function: this.dbh.registerUser, dataFilter: (data) => [data.name] }, // This should create the new user in the database with a pair
      getLists: { function: this.dbh.getLists, dataFilter: () => [] },
      getUserData: { function: this.dbh.getUser, dataFilter: () => [] },
      
      // TODO Notify the other user in the pair about the changes in the following events
      joinToPair: { function: this.dbh.joinToPair, dataFilter: (data) => [data.partnerEmail] },
      deletePair: { function: this.dbh.deletePair, dataFilter: () => [] }, 
      createList: { function: this.dbh.createList, dataFilter: (data) => [data.name] },
      addItem: { function: this.dbh.addItemToList, dataFilter: (data) => [data.listId, data.itemName, data.quantity] },
      deleteItem: { function: this.dbh.deleteItem, dataFilter: (data) => [data.itemId] },
      deleteList: { function: this.dbh.deleteList, dataFilter: (data) => [data.listId] },
      renameList: { function: this.dbh.renameList, dataFilter: (data) => [data.listId, data.listName] },
      changeQuantity: { function: this.dbh.changeQuantity, dataFilter: (data) => [data.itemId, data.quantity] }, // TODO add a test case for this
      doneItem: { function: this.dbh.doneItem, dataFilter: (data) => [data.itemId, data.done] }, // TODO add a test case for this
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
   * Registers events to the socket
   */
  private registerHandlers(socket: SocketIO.Socket) {
    for (let event in this.handleMap) {
      const record: HandleMapRecord = this.handleMap[event]
      
      socket.on(event, (data: string) => {  
        const parsed_data = this.safeParse(data)
        const request: SocketRequest = {
          rawData: data,
          event: event,
          mappedFunction: record.function.bind(this.dbh),
          dataFilter: record.dataFilter,
          socket: socket,
          data: parsed_data,
          histId: parsed_data.histId || -33, // Note that, sending back the history id is a ferature, but the client doesn't have to send the histId.
          token: parsed_data.token || ''
        }

        // These values are lifted up to root of request
        delete request.data.histId
        delete request.data.token

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
   * Authenticate the request (looking for valid token) and binding the mapped function
   * Search for a handler function that will be executed to make the response
   * Make the response, pack it, and emit back
   * After emit, notify the other user to sync
   */
  private async process(request: SocketRequest) {
    
    request.userData = await validateToken(request.token)
    if (request.userData == null) {
      request.mappedFunction = () => new Error("Authentication failed")
    }

    // console.log('Data from socket:', request.data) // TODO move to logger, and remove the auth token from it
    const result = await this.serve(request)
    // console.log('Result after handler:', result) // TODO add to logger


    // TODO Notify the other user in the pair about tha change here
  }

  /**
   * Serve the request. Sends back some data
   */
  private async serve(request: SocketRequest) {
    const email = request.userData ? request.userData.email : ''
    let response = await this.response(request.mappedFunction, [email, ...request.dataFilter(request.data)])
    response.histId = request.histId // Sending back the history id. It will be -33 if the there was none in the request
    request.socket.emit(request.event, response)
  }

  /**
   * Creates a response object safely. Catches every error 
   */
  private async response(func: CallableFunction, args: any[]) {
    try {
      return this.packResponse(await func(...args))
    } catch (failedResponse) {
      return this.packResponse(failedResponse)
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
        origin: (result instanceof DatabaseError) ? 'DatabaseHandler' : 'EventHandler',
        histId: -1 // Setting it later, just before the emit 
      }
    } else {
      return {
        success: true,
        data: result,
        histId: -1 // Setting it later, just before the emit 
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
  partnerEmail: string,
  listId: number
  itemName: string,
  quantity: number,
  itemId: number,
  token?: string,
  histId?: number,
  done: boolean
}

type SuccessfullSocketResponse = {
  success: true,
  data: any,
  histId: number
}

type FailedSocketResponse = {
  success: false,
  error: DatabaseErrorMessage,
  origin: 'DatabaseHandler' | 'EventHandler',
  histId: number
}

type HandleMapType = {
  [key in string]: HandleMapRecord
};

type HandleMapRecord = {
  function: CallableFunction,
  dataFilter: DataFilterType
}

type DataFilterType = (data: SocketInput) => (string | null | number | boolean)[]

type SocketEvent = 'login' | 'createNewPair'

type SocketRequest = {
  data: SocketInput,
  rawData: string,
  event: SocketEvent | string
  mappedFunction: CallableFunction,
  dataFilter: DataFilterType,
  socket: SocketIO.Socket,
  histId: number,
  token: string,
  userData? : any
}