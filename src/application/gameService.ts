import { connectMySQL } from '../infrastructure/connection'
import { TurnRepository } from '../domain/turn/turnRepository'
import { firstTurn } from '../domain/turn/turn'
import { GameRepository } from '../domain/game/gameRepository'
import { Game } from '../domain/game/game'

const turnRepository = new TurnRepository()
const gameRepository = new GameRepository()

export class GameService {
    async startNewGame() {
        const conn = await connectMySQL()
        const now = new Date()
        try {
            await conn.beginTransaction()
            const game = await gameRepository.save(conn, new Game(undefined, now))

            if (!game || !game.id) {
                throw new Error('Failed to insert game')
            }

            const turn = firstTurn(game.id, now)
            await turnRepository.save(conn, turn)

            await conn.commit()
        } finally {
            await conn.end()
        }
    }
}