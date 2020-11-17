import * as functions from 'firebase-functions'
import * as express from 'express'
import {log} from "firebase-functions/lib/logger";
import {Controller} from "./controller/controller";

const app: express.Express = express()
app.use(express.json())
const router: express.Router = express.Router()
const controller = new Controller()

// 最初の入荷
router.post('/create', (req:express.Request, res:express.Response) => {
    controller.create(req).then(data => {
            res.status(200)
            res.send({data:data})
        }
    ).catch(e => {
            log(e.toString())
            res.status(400)
        }
    )
})

router.post('/createOrder',(req:express.Request, res:express.Response) => {
    controller.createOrder(req).then(data =>{
        res.status(200)
        res.send({data:data})
    }).catch(e => {
        log(e.toString())
        res.status(400)
    })
})

// 全ての取得
router.post('/getAll', (req:express.Request, res:express.Response) => {
    controller.getAll().then(data => {
        res.status(200)
        res.send(data)
    }).catch(e => {
        log(e.toString())
        res.send(400)
    })
})

// 入荷　
router.post('/increase', (req:express.Request, res:express.Response) => {
    controller.increment(req).then(data => {
        if(data){
            res.status(200)
        }else{
            res.status(500)
        }
        res.send()
    }).catch(e => {
        log(e.toString())
        res.status(400)
        res.send()
    })
})

// 数を減らす
router.post('/decrease', (req:express.Request, res:express.Response) => {
    controller.decrement(req).then(data => {
        if(data){
            res.status(200)
        }else{
            res.status(500)
        }
        res.send()
    }).catch(e => {
        log(e.toString())
        res.status(400)
        res.send()
    })
})


app.use(router)

export const inventoryControl = functions.region('asia-northeast1').https.onRequest(app)
