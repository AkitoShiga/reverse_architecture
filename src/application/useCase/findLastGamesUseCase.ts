import { FindLastGamesQueryService } from "../../application/query/findLastGameQueryService"
import { FindLastGamesQueryModel } from "../../application/query/findLastGameQueryService"
import { connectMySQL } from "../../infrastructure/connection"
const FIND_COUNT = 10
export class FindLastGamesUseCase {
        constructor(private _queryService: FindLastGamesQueryService){}
    async run(): Promise<FindLastGamesQueryModel[]> {
//         const findCount = 10

//         // 最新の対戦を取得
//         const games = await gameRepository.findLast(findCount)
//         const gameIds = games.map((game) => game.id)

//         const gameResults = await gameResultRepository.findByGameIds(gameIds)

//         // 対戦IDに紐づくターンを取得
//         const turns = await turnRepository.findForGameIds(gameIds)
// /*
//         {
//             gameId: 1,
//             darkMoveCount: 1,
//             lightMoveCount: 1,
//             startedAt: '2020-01-01 00:00:00',
//             endAt: '2020-01-01 00:00:00',
//         }
//         */

//         const outputGames = games.map((game) => {
//             //対戦と対応する対戦結果を取得
//             const gameResult = gameResults.filter(
//                 (gameResult) => gameResult.gameId === game.id
//             )

//             // 対戦と対応するターン一覧を検索
//             const turnsForGame = turns.filter((turn) => turn.gameId === game.id)
//             const darkMoveCount = turnsForGame.filter( (turn) => turn.disc === Disc.Dark).length
//             const lightMoveCount = turnsForGame.filter((turn) => turn.disc === Disc.Light).length
//             return {
//                 gameId: game.id,
//                 darkMoveCount,
//                 lightMoveCount,
//                 startedAt: game.startedAt,
//                 endAt: game.endAt,
//             }
//         })

//         return {games: outputGames}

        const conn = await connectMySQL()
        try {
            return await this._queryService.query(conn, FIND_COUNT)
        } finally {
            conn.end()
        }
    }
}