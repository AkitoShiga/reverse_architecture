import  mysql from 'mysql2/promise'
import { GameRecord } from './gameRecord'

// Table data gateway
// 
export class GameGateway {

    // 最新のゲームを取得する
    async findLatest(conn: mysql.Connection): Promise<GameRecord | undefined> {
        const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
            'select id, started_at from games order by id desc limit 1'
        )
        const record = gameSelectResult[0][0]

        if (!record) {
            return undefined
        }

        return new GameRecord(record['id'], record['started_at'])
    }

    // ゲームを新規作成する
    async insert(conn: mysql.Connection, startedAt: Date): Promise<GameRecord> {
        const gameInsertResult = await conn.execute<mysql.ResultSetHeader>(
            'insert into games (started_at) values (?)',
            [startedAt]
        )
        const id = gameInsertResult[0].insertId

        return new GameRecord(id, startedAt)
    }
}