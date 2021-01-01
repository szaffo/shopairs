import { Item, List, Pair, PrismaClient, User } from "@prisma/client";
import { generator } from "./codeGenerator";

// TODO Create constants for error messages

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }

  definition(): DatabaseErrorMessage {
    return this.message
  }
}

export default class DatabaseHandler {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.prisma.$use(async (params, next) => {
      console.log(`Prisma.${params.model}.${params.action}(${JSON.stringify(params.args)})`) // TODO add to logger
      return next(params)
      // In memory of 4 hours bug searching:
      // I forgot to put return in before next(params)
    })
  }

  async registerUser(email: string, name?: string): Promise<User | DatabaseError> {
    const user = await this.getUser(email)    
    
    if (user instanceof DatabaseError) {
      return this.prisma.user.create({
        data: { email, name },
      }).then((user) => {
        return user
      })  
    } else {
      return new DatabaseError('User already exists')
    }

  }

  async createNewPair(email: string): Promise<Pair | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return new DatabaseError("Email or password is not correct");
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

  // async authenticateUser(email: string, password: string): Promise<Boolean | DatabaseError> {
    // return true
    // return await this.prisma.user.findFirst({
    //   where: { email }, // Email has a unique constraint
    //   select: { password: true }
    // }).then((user) => {
    //   if (!(user instanceof Object)) return new DatabaseError("User not found in the database");
    //   // ! DO NOT tell the client the email is not exists.
    //   // ! Just send back "Email or password is incorrect"
    //   // ! They don't have to know everything. It's more secure this way.

    //   return comparePassword(password, user.password).then((success) => {
    //     return success
    //   })
    // })
  // }


  async getUser(email: string): Promise<UserData | DatabaseError> {
    return this.prisma.user
      .findOne({
        where: { email }, // Email has a unique constraint
        select: {
          email: true,
          name: true,
          id: true,
          updated_at: true,
          created_at: true,
          createdPair: true,
          joinnedToPair: true,
        },
      })
      .then((user) => {
        if (user) {
          return user;
        } else {
          return new DatabaseError("User does not exists");
        }
      });
  }


  async joinToPair(
    email: string,
    connectionCode: string
  ): Promise<Pair | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return new DatabaseError(
          "User does not exists or failed to authenticate"
        );
      }

      if (user.createdPair || user.joinnedToPair) {
        return new DatabaseError("User already has a pair");
      }

      return this.prisma.pair
        .update({
          where: { connection_code: connectionCode },
          data: {
            connection_code: null,
            joinner: {
              connect: {
                id: user.id,
              },
            },
          },
        })
        .then((pair) => {
          return pair || new DatabaseError("Pair not found");
        })
        .catch(() => {
          return new DatabaseError("Pair not found");
        });
    });
  }

  async deletePair(email: string): Promise<Pair | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return user;
      }

      if (!(user.joinnedToPair || user.createdPair)) {
        return new DatabaseError("User does not have a pair");
      }

      const pair = user.createdPair || user.joinnedToPair || { id: 0 };

      return this.prisma.pair
        .delete({
          where: { id: pair.id },
        })
        .then((pair) => {
          return pair;
        });
    });
  }


  async createList(email: string, name: string): Promise<List | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return user
      }

      const pair = user.createdPair || user.joinnedToPair

      if (!pair) {
        return new DatabaseError('User does not have a pair')
      }

      return this.prisma.list.create({
        data: {
          name,
          belongsTo: {
            connect: {
              id: pair.id
            }
          }
        }
      }).then((list) => {
        return list
      })
    })

  }

  async addItemToList(email: string, listId: number, itemName: string, quantity?: number): Promise<Item | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return user
      }

      const pair = user.createdPair || user.joinnedToPair

      if (!pair) {
        return new DatabaseError('User does not have a pair')
      }

      return this.prisma.list.findOne({
        where: {
          id: listId
        }
      }).then((list) => {
        if (!list) {
          return new DatabaseError("List not found")
        }

        if (list.belongs_to !== pair.id) {
          return new DatabaseError('List does not belongs to the pair')
        }

        return this.prisma.item.create({
          data: {
            name: itemName,
            quantity,
            belongsTo: {
              connect: {
                id: list.id
              }
            }
          }
        }).then((item) => {
          return item || new DatabaseError('Can not add item')
        })
      })

    })
  }

  async getLists(email: string): Promise<List[] | DatabaseError> {
    return await this.getUser(email).then((user) => {
      if (user instanceof DatabaseError) {
        return user;
      }

      const pair = user.createdPair || user.joinnedToPair;

      if (!pair) {
        return new DatabaseError("User does not have a pair");
      }


      return this.prisma.list.findMany({
        where: {
          belongsTo: pair
        },
        select: {
          name: true,
          id: true,
          created_at: true,
          updated_at: true,
          items: true,
          belongs_to: true
        }
      }).then((lists) => {
        return lists
      })

    })
  }

  async deleteList(email: string, listId: number): Promise<List | DatabaseError> {

    const user = await this.getUser(email);

    if (user instanceof DatabaseError) {
      return user;
    }



    const list = await this.prisma.list.findOne({ where: { id: listId } });

    if (list instanceof DatabaseError) {
      return list;
    }

    const items = await this.prisma.item.deleteMany({
      where: { belongs_to: listId },
    });

    return this.prisma.list
      .delete({
        where: { id: listId },
      })
      .then((list) => {
        return list;
      });
  }

  async renameList(email: string, listId: number, listName: string): Promise<List | DatabaseError> {
    const user = await this.getUser(email);

    if (user instanceof DatabaseError) {
      return user
    }

    const pair = user.createdPair || user.joinnedToPair

    if (!pair) {
      return new DatabaseError('User does not have a pair')
    }

    return await this.prisma.list.update({ where: { id: listId }, data: { name: listName } }).then((list) => { return list; })

  }

  async deleteItem(email: string, itemId: number) {
    const user = await this.getUser(email);
    
    if (user instanceof DatabaseError) {
      return user
    }

    const pair = user.createdPair || user.joinnedToPair

    if (!pair) {
      return new DatabaseError('User does not have a pair')
    }

    const item = await this.prisma.item.findOne({
      where: { id: itemId},
      select: {
        belongsTo: {
          select: {
            belongsTo: {
              select: {
                id: true,
                creator: true,
                joinner: true
              }
            }
          }
        }
      }
    })

    if (!item) {
      return new DatabaseError('Item not found')
    }

    if (item.belongsTo.belongsTo.id === pair.id) {
      return this.prisma.item.delete({
        where: { id: itemId}
      })
    } else {
      return new DatabaseError('Forbidden')
    }
  }

  disconnect(): void {
    this.prisma.$disconnect();
  }


  // TODO make tests
  // TODO CI 
  // TODO CD
}

/* -------------------------------------------------------------------------- */
/*                               Type definitios                              */
/* -------------------------------------------------------------------------- */
export type DatabaseErrorMessage = string

export type UserData = {
  createdPair: Pair | null;
  joinnedToPair: Pair | null;
  id: number;
  email: string;
  name: string | null;
  updated_at: Date;
  created_at: Date;
}
