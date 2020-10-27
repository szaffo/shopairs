import bcrypt from 'bcrypt'

const saltRounds = 12 // TODO Move this to .env or config.json

export function hashPassword(pw: String): Promise<string> {
    return bcrypt.hash(pw, saltRounds)
}

export async function comparePassword(pw: String, hash: string): Promise<Boolean> {
    return await bcrypt.compare(pw, hash)
}