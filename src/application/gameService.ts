import { GameGateway } from '../dataaccess/gameGateway'
import { TurnGateway } from '../dataaccess/turnGateway'
import { SquareGateway } from '../dataaccess/squareGateway'
import { connectMySQL } from '../dataaccess/connection'
import { DARK, INITIAL_BOARD } from './constants'

export class GameService {
    async startNewGame() {
        const gameGateway = new GameGateway()
        const turnGateway = new TurnGateway()
        const squareGateway = new SquareGateway()
        const conn = await connectMySQL()
        const now = new Date()
        try {
            await conn.beginTransaction()
            const gameRecord = await gameGateway.insert(conn, now)
            const turnRecord = await turnGateway.insert(conn, gameRecord.id, 0, DARK, now)
            if (!turnRecord) {
                throw new Error('Failed to insert turn')
            }
            await squareGateway.insertAll(conn, turnRecord.id, INITIAL_BOARD)
            await conn.commit()
        } finally {
            await conn.end()
        }
    }
}