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

  registerUser(email: string, password: string, name?: string): Promise<User> {
    return this.prisma.user.create({
      data: { email, password, name },
    });
  }

  async createNewPair(
    email: string,
    password: string
  ): Promise<Pair | DatabaseError> {
    const user = await this.prisma.user.findFirst({
      where: { email, password },
      select: { id: true, pair: true },
    });

    if (user) {
      const pair = user.pair;
      if (pair) {
        return new DatabaseError("The user already has a pair.");
      } else {
        const pair = await this.prisma.pair.create({
          data: {
            pair1_id: user.id,
            connection_code: "DUMMY",
          },
        });
        return pair;
      }
    } else {
      throw new DatabaseError(
        "User authentication failed, or the user does not exists."
      );
    }
  }
}
