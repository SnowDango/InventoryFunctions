import * as functions from 'firebase-functions'
import * as express from 'express'
import {database} from './ItemModel'
import {log} from "firebase-functions/lib/logger";

const app: express.Express = express()
app.use(express.json())
const router: express.Router = express.Router()

// 最初の入荷
router.post('/create', (req:express.Request, res:express.Response) => {
    database.addInventory(req).then(data => {
            res.status(200)
            res.send({data:data})
        }
    ).catch(e => {
            log(e.toString())
            res.status(400)
        }
    )
})

router.post('/createOrder',(req, res) => {
    database.addOrder(req).then(data =>{
        res.status(200)
        res.send({data:data})
    }).catch(e => {
        log(e.toString())
        res.status(400)
    })
})

// 全ての取得
router.post('/getAll', (req, res) => {
    database.getAll().then(data => {
        res.status(200)
        res.send(JSON.stringify(data))
    }).catch(e => {
        log(e.toString())
        res.send(400)
    })
})

// 入荷　
router.post('/increase', (req, res) => {
    database.increaseInventory(req).then(num => {
        res.status(200)
        res.send({num:num})
    }).catch(e => {
        log(e.toString())
        res.send(400)
    })
})

// 数を減らす
router.post('/decrease', (req:express.Request, res:express.Response) => {
    database.decreaseInventory(req).then(num => {
        res.send({num:num})
    }).catch(e => {
        log(e.toString())
        res.send(400)
    })
})


app.use(router)

export const inventoryControl = functions.region('asia-northeast1').https.onRequest(app)
