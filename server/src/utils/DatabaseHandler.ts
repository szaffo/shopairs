import { Pair, PrismaClient, User } from "@prisma/client";
import { comparePassword, hashPassword } from "./passwordHash";
import { generator } from "./codeGenerator";

// TODO Create constants for error messages

export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export default class DatabaseHandler {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async registerUser(email: string, password: string, name?: string): Promise<User | DatabaseError> {
    return await this.authenticateUser(email, password).then((succes) => {
      if (typeof succes === typeof DatabaseError) {
        return hashPassword(password).then((hash) => {
          return this.prisma.user.create({
            data: { email, password: hash, name },
          });  
        })
      } else {
        return new DatabaseError('User already exists')
      }
    })   
  }

  async createNewPair(email: string, password: string): Promise<Pair | DatabaseError> {
    return await this.getUser(email, password).then((user) => {
      if (user instanceof DatabaseError) {
        return new DatabaseError('Email or password is not correct')
      } else {

        if (user.createdPair || user.joinnedToPair) {
          return new DatabaseError("The user already has a pair");
        }
        
        return this.prisma.pair.create({
          data: {
            creator: {
              connect: { id: user.id }
            },
            // ! This code should be deleted when other user is joinning to the pair
            // ! to avoid unique constraint fail
            connection_code: generator(),
          },
        }).then((pair) => {
          return pair
        })
        
      }

    })
 }

  /**
   * ! This method should be used only by the Database handler class.
   * Use the getUser() method instead. That also gives back the user, and 
   * authenticates too!
   */
  async authenticateUser(email: string, password: string): Promise<Boolean | DatabaseError> {
    return await this.prisma.user.findOne({
      where: { email }, // Email has a unique constraint
      select: { password: true }
    }).then((user) => {
      
      if (!user) return new DatabaseError("User does not exits");
      // ! DO NOT tell the client the email is not exists.
      // ! Just send back "Email or password is incorrect"
      // ! They don't have to know everything. It's more secure this way.

      return comparePassword(password, user.password).then((success) => {
        return success
      })   
    })
  }

  /**
   * * The getUser is a secure way to get the data about the
   * * user. It also authenticates the user, checks for existance,
   * * and the returned user object won't include the password field
   */ 
  async getUser(email: string, password: string): Promise<{
    createdPair: Pair | null;
    joinnedToPair: Pair | null;
    id: number;
    email: string;
    password: string;
    name: string | null;
    updated_at: Date;
    created_at: Date;
  } | DatabaseError> {
    return await this.authenticateUser(email, password).then((succes) => {

      
      // ! DO NOT tell the client the email is not exists.
      // ! Just send back "Email or password is incorrect"
      // ! They don't have to know everything. It's more secure this way.

      if (typeof succes === typeof DatabaseError) {
        return new DatabaseError('Email or password is not correct')
      } 

      if (!succes) {
        return new DatabaseError('Email or password is not correct')
      }


      return this.prisma.user.findOne({
        where: { email }, // Email has a unique constraint
        select: {
          email: true,
          name: true,
          id: true,
          updated_at: true,
          created_at: true,
          createdPair: true,
          joinnedToPair: true,
          password: true // Pw is a must here. Hiding in the next .then()
        }
      }).then((user) => {
        if (user) {
          user.password = 'HIDDEN' // ! This may cause some error later
          return user
        } else {
          return new DatabaseError('User does not exists')
        }
      })
    })
  }

  async joinToPair(email: string, password: string, connectionCode: string): Promise<Pair | DatabaseError> {
    return await this.getUser(email, password).then((user) => {
      if (user instanceof DatabaseError) {
        return new DatabaseError('User does not exists or failed to authenticate')
      }

      if (user.createdPair || user.joinnedToPair) {
        return new DatabaseError('User already has a pair')
      }

      return this.prisma.pair.update({
        where: { connection_code: connectionCode },
        data: {
          connection_code: null,
          joinner: {
            connect: {
              id: user.id
            }
          }
        }
      }).then((pair) => {
        return pair || new DatabaseError('Pair not found')
      })
    })
  }
}
