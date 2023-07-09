import mysql from 'mysql2/promise'
import { Game } from './game';
import { GameGateway } from '../../infrastructure/gameGateway';
import { GameRecord } from '../../infrastructure/gameRecord';

const gameGateway = new GameGateway()

export class GameRepository {
    async findLatest(conn: mysql.Connection): Promise<Game | undefined> {
        const gameRecord = await gameGateway.findLatest(conn)

        if(!gameRecord) {
            return undefined
        }

        return new Game(gameRecord.id, gameRecord.startedAt)
    }

    async save(conn: mysql.Connection, game: Game): Promise<Game|undefined> {
        const gameRecord = await gameGateway.insert(conn, game.startedAt)

        return new Game(gameRecord.id, gameRecord.startedAt)
    }
}