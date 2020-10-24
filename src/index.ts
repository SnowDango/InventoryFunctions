import * as functions from 'firebase-functions'
import * as express from 'express'
import {database} from './ItemModel'

const app: express.Express = express()
app.use(express.json())
const router: express.Router = express.Router()

// 最初の入荷
router.post('/create', (req:express.Request, res:express.Response) => {
    database.add(req).then(_ =>
        res.send({type:"SUCCESS"})
    ).catch(_ =>
        res.send({type:"ERROR"})
    )
})

// 全ての取得
router.post('/getAll', (req, res) => {
    database.getAll(req).then(data => {
        res.send(JSON.stringify(data))
    }).catch(_ => {
        res.send("ERROR")
    })
})

// 入荷　
router.post('/increase', (req, res) => {
    database.increase(req).then(num => {
        res.send({num:num})
    }).catch(_ => {
        res.send("ERROR")
    })
})

// 数を減らす
router.post('/decrease', (req:express.Request, res:express.Response) => {
    database.decrease(req).then(num => {
        res.send({num:num})
    }).catch(_ => {
        res.send("ERROR")
    })
})


app.use(router)

export const inventoryControl = functions.region('asia-northeast1').https.onRequest(app)
