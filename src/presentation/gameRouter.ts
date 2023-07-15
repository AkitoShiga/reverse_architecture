import express from 'express'
import { StartNewGameUseCase } from '../application/useCase/startNewGameUseCase'
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository'
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository'
import { FindLastGamesMySQLQueryService } from '../infrastructure/query/findLastGamesMySQLQueryService'
import { FindLastGamesQueryModel } from '../application/query/findLastGameQueryService'
import { FindLastGamesUseCase } from '../application/useCase/findLastGamesUseCase'

export const gameRouter = express.Router()

const startNewGameUseCase = new StartNewGameUseCase(
  new GameMySQLRepository(),
  new TurnMySQLRepository()
)

const findLastGamesUseCase = new FindLastGamesUseCase(
  new FindLastGamesMySQLQueryService()
)
interface GetGamesResponseBody {
  games: {
    id: number
    darkMoveCount: number
    lightMoveCount: number
    winnerDisc: number | undefined
    startedAt: Date
    endAt: Date | undefined
  }[]
}

import { Game } from '../domain/model/game/game'
gameRouter.get(
  '/api/games',
  async (req, res: express.Response<GetGamesResponseBody>) => {
  const output = await findLastGamesUseCase.run()
  const responseBodyGames = output.map((g: FindLastGamesQueryModel) => {
    return {
      id: g.gameId,
      darkMoveCount: g.darkMoveCount,
      lightMoveCount: g.lightMoveCount,
      winnerDisc: g.winnerDisc,
      startedAt: g.startedAt,
      endAt: g.endAt,
    }
  })
  const responseBody: GetGamesResponseBody = { games: responseBodyGames }
  res.json(responseBody)
})

gameRouter.post('/api/games', async (req, res) => {
  await startNewGameUseCase.run()

  res.status(201).end()
})
