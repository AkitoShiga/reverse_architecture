import mysql from 'mysql2/promise'
import { GameGateway } from '../dataaccess/gameGateway'
import { TurnGateway } from '../dataaccess/turnGateway'
import { MoveGateway } from '../dataaccess/moveGateway'
import { SquareGateway } from '../dataaccess/squareGateway'
import { connectMySQL } from '../dataaccess/connection'
import { DARK, LIGHT } from '../application/constants'

const turnGateway = new TurnGateway()
const gameGateway = new GameGateway()
const squareGateway = new SquareGateway()
const moveGateway = new MoveGateway()

class FindLatestGameTurnByTurnCountOutput {
    constructor (
        private _turnCount: number,
        private _board: number[][],
        private _nextDisc: number | undefined,
        private _winnerDisc: number | undefined
    ) {}

    get turnCount() {
        return this._turnCount
    }
    get board() {
        return this._board
    }
    get nextDisc() {
        return this._nextDisc
    }
    get winnerDisc() {
        return this._winnerDisc
    }
}

export class TurnService {
    async findLatestGameTurnByTurnCount(turnCount: number): Promise<FindLatestGameTurnByTurnCountOutput> {
        const conn = await connectMySQL()
        try {

            const gameRecord = await gameGateway.findLatest(conn)
            if (!gameRecord) {
                throw new Error('latest game not found')
            }

            const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount)
            if (!turnRecord) {
                throw new Error('Specified turn not found')
            }


            const squareSelectResult = await conn.execute<mysql.RowDataPacket[]>(
                'select id, turn_id, x, y, disc from squares where turn_id = ?', [turnRecord.id]
            )
            const squares = squareSelectResult[0]
            const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
            squares.forEach((s) => {
                board[s.y][s.x] = s.disc
            })
             return new FindLatestGameTurnByTurnCountOutput(turnCount,
                                                            board,
                                                            turnRecord.nextDisc,
                                                            undefined) 
        } finally {
            await conn.end()
        }
    }

    async registerTurn(turnCount: number, disc: number, x: number, y: number) {
        const conn = await connectMySQL()
        try {

            const gameRecord = await gameGateway.findLatest(conn)
            if (!gameRecord) {
                throw new Error('latest game not found')
            }

            // パラメーターの一つ前のターンを取得
            const previousTurnCount = turnCount - 1
            const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount)
            if (!previousTurnRecord) {
                throw new Error('Specified turn not found')
            }


            // ターンの盤面を取得
            const squareSelectResult = await conn.execute<mysql.RowDataPacket[]>(
                'select id, turn_id, x, y, disc from squares where turn_id = ?',[previousTurnRecord.id]
            )
            const squares = squareSelectResult[0]

            // マップの盤面の情報を配列に格納
            const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
            squares.forEach((s) => {
                board[s.y][s.x] = s.disc
            })

            // 盤面に置けるかチェック
            // 石を置く
            board[y][x] = disc
            // ひっくり返す
            // ターンを保存する
            const nextDisc = disc === DARK ? LIGHT : DARK
            const now = new Date()

            const turnRecord = await turnGateway.insert(conn, gameRecord.id, turnCount, nextDisc, now)
            if (!turnRecord) {
                throw new Error('Failed to insert turn')
            }

            await squareGateway.insertAll(conn, turnRecord.id, board)
            await moveGateway.insert(conn, turnRecord.id, disc, x, y)

        } finally {
            await conn.end()
        }
    }
}