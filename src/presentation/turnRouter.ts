import express from 'express'
import mysql from 'mysql2/promise'
import { GameGateway } from '../dataaccess/gameGateway'
import { TurnGateway } from '../dataaccess/turnGateway'
import { MoveGateway } from '../dataaccess/moveGateway'
import { SquareGateway } from '../dataaccess/squareGateway'
import { connectMySQL } from '../dataaccess/connection'
import { DARK, LIGHT } from '../application/constants'


export const turnRouter = express.Router()

const turnGateway = new TurnGateway()
const gameGateway = new GameGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()


turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res) => {
    const turnCount = parseInt(req.params.turnCount)
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
        const responseBody = {
            turnCount,
            board,
            nextDisc: turnRecord.nextDisc,
            winnerDisc: null
        }
        res.json(responseBody)
    } finally {
        await conn.end()
    }
})
turnRouter.post('/api/games/latest/turns', async(req, res)=> {
    const turnCount = parseInt(req.body.turnCount)
    const disc = parseInt(req.body.move.disc)
    const x = parseInt(req.body.move.x)
    const y = parseInt(req.body.move.y)
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
    res.status(201).end()

})