## 対戦を開始する
* 対戦を登録する
  * POST /api/games
##  盤面を見る
*  現在の盤面を表示する
* 指定したターン数のターンを取得する
* GET /api/games/latest/turns/{turnCount}
* レスポンスボディ
```json 
{
    "turnCount": 1,
    "board": [
        [0, 0, 0, 0, 0 ,0 ,0, 0],
        [0, 0, 0, 0, 0 ,0 ,0, 0],
        [0, 0, 0, 0, 0 ,0 ,0, 0],
        [0, 0, 0, 1, 2 ,0 ,0, 0],
        [0, 0, 0, 2, 1 ,0 ,0, 0],
        [0, 0, 0, 0, 0 ,0 ,0, 0],
        [0, 0, 0, 0, 0 ,0 ,0, 0],
        [0, 0, 0, 0, 0 ,0 ,0, 0]
    ],
    "nextDisc": 1,
    "winnerDisc": 1
}
```
## 石を打つ
## 勝敗を確認する
* ターンを登録
  * POST /api/games/latest/turns
  * リクエストボディ  
  ```json
  {
    "turnCount": 1,
    "move": {
        "disc": 1,
        "x": 0,
        "y": 0
    }

  }
  ```

## 「自分の過去の対戦結果を確認する」
* 対戦の一覧を取得する
  * GET /api/games
  ```json
  {
    "games": [
        {
            "id": 1,
            "winnerDisc": 1,
            "startedAt": "YYYY-MM-DD hh:mm:ss"
        }
    ]
  }