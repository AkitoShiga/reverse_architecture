import mysql from 'mysql2/promise'
import { connectMySQL } from '../infrastructure/connection'
import { toDisc } from '../domain/turn/disc'
import { Point } from '../domain/turn/point'
import { TurnRepository } from '../domain/turn/turnRepository'
import { GameRepository } from '../domain/game/gameRepository'

const gameRepository = new GameRepository()
const turnRepository = new TurnRepository()

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

            const game = await gameRepository.findLatest(conn)
            if (!game || !game.id) {
                throw new Error('latest game not found')
            }
            const turn = await turnRepository.findForGmaeIdAndTurnCount(conn, game.id, turnCount)

             return new FindLatestGameTurnByTurnCountOutput(turnCount,
                                                            turn.board.discs,
                                                            turn.nextDisc,
                                                            undefined) 
        } finally {
            await conn.end()
        }
    }

    async registerTurn(turnCount: number, disc: number, x: number, y: number) {
        const conn = await connectMySQL()
        try {

            const game = await gameRepository.findLatest(conn)
            if (!game || !game.id) {
                throw new Error('latest game not found')
            }

            // パラメーターの一つ前のターンを取得
            const previousTurnCount = turnCount - 1
            const previousTurn = await turnRepository.findForGmaeIdAndTurnCount(conn, game.id, previousTurnCount)
            if (!previousTurn) {
                throw new Error('Specified turn not found')
            }

            // 石を置く
            const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y))
            await turnRepository.save(conn, newTurn)
            await conn.commit()


        } finally {
            await conn.end()
        }
    }
}