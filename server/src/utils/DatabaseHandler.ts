import { Item, List, Pair, PrismaClient, User } from "@prisma/client";

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

  constructor(log: boolean = true) {
    this.prisma = new PrismaClient();
    
    if (log) {   
      this.prisma.$use(async (params, next) => {
        console.log(`Prisma.${params.model}.${params.action}(${JSON.stringify(params.args)})`) // TODO add to logger
        return next(params)
        // In memory of 4 hours bug searching:
        // I forgot to put return in before next(params)
      })
    }
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


  async joinToPair(email: string, partnerEmail: string): Promise<Pair | DatabaseError> {
    const joinner = await this.getUser(email);
    const creator = await this.getUser(partnerEmail);
    
    if (joinner instanceof DatabaseError) {return new DatabaseError("User does not exists");}
    if (creator instanceof DatabaseError) {return new DatabaseError("Partner not found");}
    
    if (creator.createdPair || creator.joinnedToPair) {return new DatabaseError("Partner already has a pair");}
    if (joinner.createdPair || joinner.joinnedToPair) {return new DatabaseError("You are already in a pair");}


    return this.prisma.pair
      .create({
        data: {
          creator: {connect: { id: creator.id}},
          joinner: {connect: { id: joinner.id}}
        },
      })
      .then((pair) => {
        return pair || new DatabaseError("Something went wrong during creating the pair");
      })
      .catch(() => {
        return new DatabaseError("Something went wrong during creating the pair");
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
    const user = await this.getUser(email)
    
    if (user instanceof DatabaseError) {
      return new DatabaseError('User not found in the database');
    }
    
    const pair = user.createdPair || user.joinnedToPair;

    if (!pair) {
      return new DatabaseError("You have to be in a pair first");
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
