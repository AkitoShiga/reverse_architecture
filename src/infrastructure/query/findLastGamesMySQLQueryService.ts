import mysql from 'mysql2/promise'
import { FindLastGamesQueryService } from "../../application/query/findLastGameQueryService";
import { FindLastGamesQueryModel } from "../../application/query/findLastGameQueryService";

export class FindLastGamesMySQLQueryService implements FindLastGamesQueryService {
    async query(conn: mysql.Connection, limit: number): Promise<FindLastGamesQueryModel[]> {
        const selectResult = await conn.execute<mysql.RowDataPacket[]>(
            `
            select
              max(g.id) as game_id,
              sum(case when m.disc = 1 then 1 else 0 end) as dark_move_count,
              sum(case when m.disc = 2 then 1 else 0 end) as light_move_count,
              max(gr.winner_disc) as winner_disc,
              max(g.started_at) as started_at,
              max(gr.end_at) as end_at
            from games g
            left join game_results gr on g.id = gr.game_id
            left join turns t on g.id = t.game_id
            left join moves m on t.id = m.turn_id
            group by g.id
            order by g.id desc
            limit ?
            `, [limit.toString()]
        )
        const records = selectResult[0]
        return records.map((r) => {
            return new FindLastGamesQueryModel(
                r['game_id'],
                r['dark_move_count'],
                r['light_move_count'],
                r['winner_disc'],
                r['started_at'],
                r['end_at'])
            }
        )
    }
}