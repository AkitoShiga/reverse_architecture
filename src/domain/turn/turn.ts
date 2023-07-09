import { Board, initialBoard } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Turn {
    constructor(
        private _gameId: number,
        private _turnCount: number,
        private _nextDisc: Disc,
        private _move: Move | undefined,
        private _board: Board,
        private _endAt: Date) {}

    get endAt() {
        return this._endAt
    }

    get gameId() {
        return this._gameId
    }

    get turnCount() {
        return this._turnCount
    }

    get nextDisc() {
        return this._nextDisc
    }

    get board() {
        return this._board
    }

    get move() {
        return this._move
    }

    placeNext(disc: Disc, point: Point): Turn {
        // 打とうとしたいしがが、つぎのいしと同じ色でない場合はエラー
        if(disc !== this._nextDisc) {
            throw new Error('Invalid disc')
        }

        const move = new Move(disc, point)
        const nextBoard = this._board.place(move)

        // 次のいしがおけない場合はスキップする
        const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark

        return new Turn(
            this._gameId,
            this._turnCount + 1,
            nextDisc,
            move,
            nextBoard,
            new Date()
        )

    }
}

export function firstTurn(gameId: number, endAt: Date): Turn {
    return new Turn(
        gameId,
        0,
        Disc.Dark,
        undefined,
        initialBoard,
        endAt)
}