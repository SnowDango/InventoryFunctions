import {FirestoreSimple} from '@firestore-simple/admin'
import e from "express";
import admin from "firebase-admin";
import FieldValue = admin.firestore.FieldValue;

interface ItemData{
    id: string,
    code: string,
    name: string,
    num: number,
    limit: number
}

admin.initializeApp();
const firestore = admin.firestore()
const Inventory_PATH = 'Inventory'
const Order_PATH = 'OrderList'

const firestoreSimple = new FirestoreSimple(firestore)
const inventoryDao = firestoreSimple.collection<ItemData>({ path: Inventory_PATH})
const orderDao = firestoreSimple.collection<ItemData>({path: Order_PATH})

export class database {

    static async addInventory(req: e.Request): Promise<string> {
        const body = req.body
        const mode = await this.isExist(body.code)
        if(mode){
            const id = await inventoryDao.add({code: body.code, name: body.name, num: body.num, limit: body.limit})
            return JSON.stringify(await inventoryDao.fetch(id))
        }else{
            return "already exist"
        }
    }

    static async addOrder(req: e.Request): Promise<string> {
        const body = req.body
        const id = await orderDao.add({code: body.code, name: body.name, num: body.num, limit: body.limit})
        return JSON.stringify(await orderDao.fetch(id))
    }

    static async getAll(): Promise<string>{
        const inventory = inventoryDao.fetchAll()
        const order = orderDao.fetchAll()
        const json = {inventory: inventory,order: order}
        return JSON.stringify(json)
    }

    static async increaseInventory (req: e.Request): Promise<number | undefined>{
        const targetCode = req.body.code
        const inventoryList = await inventoryDao.where('code', '==', targetCode).fetch()
        const orderList = await orderDao.where('code', '==', targetCode).fetch()
        if(inventoryList.length > 0){
            const target: ItemData = inventoryList[0]
            await inventoryDao.update({
                id:target.id,
                num: target.num + req.body.num
            })
            const updateResult = await inventoryDao.where('code','==',targetCode).fetch()
            return updateResult[0].num
        } else if(orderList.length > 0){
            const target: ItemData = orderList[0]
            await orderDao.delete(target.id)
            await inventoryDao.add({
                id:target.id,
                code: target.code,
                num: target.num + req.body.num,
                limit: target.limit,
                name: target.name
            })
            const updateResult = await inventoryDao.where('code','==',targetCode).fetch()
            return updateResult[0].num
        }else{
            return 0
        }
    }

    static async decreaseInventory(req: e.Request): Promise<number | undefined>{
        const targetList = await inventoryDao.where('code', '==', req.body.code).fetch()
        const targetId = targetList[0].id
        await inventoryDao.update({
            id: targetId,
            num: FieldValue.increment(-1 * req.body.num)
        })
        const checkResult = await database.checkInventory()
        return checkResult?.num
    }

    static async checkInventory():Promise<ItemData|null>{
        const needOrderData = JSON.parse(await database.getAll())
        let itemOder: ItemData|null = null
        for (const item of needOrderData.inventory) {
            if(item.limit > item.num){
                await inventoryDao.delete(item.id)
                await orderDao.add(item)
                itemOder = item
            }
        }
        return itemOder
    }

    static async isExist(code: string):Promise<boolean>{
        const existList = await inventoryDao.where("code","==", code).fetch()
        const existList2 = await orderDao.where("code","==",code).fetch()
        return !(existList.length > 0 || existList2.length > 0)
    }
}