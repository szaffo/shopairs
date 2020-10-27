import { Pair, PrismaClient, User } from "@prisma/client";
import { comparePassword, hashPassword } from "./passwordHash";

class DatabaseError extends Error {
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
    // Find the user in the database (also authentication)
    // TODO getUser()
    const user = await this.prisma.user.findFirst({
      where: { email, password },
      select: {
        id: true,
        createdPair: true,
        joinnedToPair: true
      },
    });

    if (user) {
      if (user.createdPair || user.joinnedToPair) {
        return new DatabaseError("The user already has a pair");
      } else { // User does not belongs to a pair
        // Creating a new pair
        return await this.prisma.pair.create({
          data: {
            creator: {
              connect: { id: user.id }
            },
            connection_code: "DUMMY", // TODO Create code creator
          },
        });
      }

    } else { // User not found with the given email & pw
      throw new DatabaseError("User authentication failed, or the user does not exists");
    }
  }

  async authenticateUser(email: string, password: string): Promise<Boolean | DatabaseError> {
    return await this.prisma.user.findOne({
      where:  { email },
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
}
