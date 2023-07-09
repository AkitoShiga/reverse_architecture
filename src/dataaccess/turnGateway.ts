import { TurnRecord } from "./turnRecord";
import mysql from 'mysql2/promise'

export class TurnGateway {

    // ゲームに紐づくターンを取得する
    async findForGameIdAndTurnCount(conn: mysql.Connection,
                                    gameId: number,
                                    turnCount: number): Promise<TurnRecord | undefined> {

        const record = await conn.execute<mysql.RowDataPacket[]>(
            'select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ?',
            [gameId, turnCount]
        )

        if (!record) {
            return undefined
        }
        const turnId: number =  record[0][0]['id']
        const nextDisc: number = record[0][0]['next_disc']
        const endAt: Date  = record[0][0]['end_at']
        
        return new TurnRecord(turnId,
                              gameId,
                              turnCount,
                              nextDisc,
                              endAt)
    }

    // ターンを新規作成する
    async insert(conn: mysql.Connection,
                 gameId: number,
                 turnCount: number,
                 nextDisc: number,
                 endAt: Date): Promise<TurnRecord | undefined> {

        const turnInsertResult = await conn.execute<mysql.ResultSetHeader>(
            'insert into turns (game_id, turn_count, next_disc, end_at) values(?, ?, ?, ?)',
            [gameId, turnCount, nextDisc, endAt])

        const turnId = turnInsertResult[0].insertId

        if (!turnId) {
            return undefined
        }

        return new TurnRecord(turnId, gameId, turnCount, nextDisc, endAt)
    }


}