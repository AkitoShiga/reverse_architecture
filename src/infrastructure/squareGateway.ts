import mysql from 'mysql2/promise'
import { SquareRecord } from './squareRecord'

export class SquareGateway {

    async findForTurnId(conn: mysql.Connection, turnId: number): Promise<SquareRecord[]> {
        const squareSelectResult = await conn.execute<mysql.RowDataPacket[]>(
            'select id, turn_id, x, y, disc from squares where turn_id = ?', [turnId]
        )
        const records = squareSelectResult[0]

        return records.map((r) => {
            const id: number = r['id']
            const x: number = r['x']
            const y: number = r['y']
            const disc: number = r['disc']
            return new SquareRecord(id, turnId, x, y, disc)
        })
    }


    async insertAll(conn: mysql.Connection, turnId: number, board: number[][]) {

        const squareCount = board
                            .map((line) => line.length)
                            .reduce((v1, v2) => v1 + v2, 0)

        const squaresInsertSql = 'insert squares (turn_id, x, y, disc) values' +
        Array.from(Array(squareCount)).map(() => '(?, ?, ?, ?)').join(', ')

        const squaresInsertValues: any[] = []
        board.forEach((line, y) => {
            line.forEach((disc, x) => {
                 squaresInsertValues.push(turnId)
                 squaresInsertValues.push(x)
                 squaresInsertValues.push(y)
                 squaresInsertValues.push(disc)
            })
        })

        await conn.execute(squaresInsertSql, squaresInsertValues)

    }

}