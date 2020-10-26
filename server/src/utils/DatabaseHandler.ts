import { Pair, PrismaClient, User } from "@prisma/client";
import { userInfo } from "os";

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

  async registerUser(email: string, password: string, name?: string): Promise<User> {
    // TODO Check if user already exists
    return await this.prisma.user.create({
      data: { email, password, name }, // TODO Strore hashed password
    });
  }

  async createNewPair(
      email: string,
      password: string
    ): Promise<Pair | DatabaseError> {
    
    // Find the user in the database (also authentication)
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
        return new DatabaseError("The user already has a pair.");
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
      throw new DatabaseError(
        "User authentication failed, or the user does not exists."
      );
    }
  }
}
