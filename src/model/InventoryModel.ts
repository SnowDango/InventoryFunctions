import {FirestoreSimple} from '@firestore-simple/admin'
import {ItemData} from "../utility/ItemData";
const Inventory_PATH = 'Inventory'

export class InventoryModel {
    inventoryDao: any
    FieldValue: any

    constructor(db: any,FieldValue: any) {
        const firestoreSimple = new FirestoreSimple(db)
        this.inventoryDao = firestoreSimple.collection<ItemData,ItemData>({path: Inventory_PATH})
        this.FieldValue = FieldValue
    }

    async create(code: string, name: string, limit: number, num: number):Promise<string>{
        return await this.inventoryDao.add({code: code,name: name, limit: limit, num: num})
    }

    async delete(code: string){
        const targetDatas = await this.inventoryDao.where('code' , '==', code).fetch()
        const targetId = targetDatas[0].id
        await this.inventoryDao.delete(targetId)
    }

    async getList():Promise<ItemData[]>{
        return await this.inventoryDao.fetchAll()
    }

    async getData(code: string): Promise<ItemData> {
        const list = await this.inventoryDao.where('code', '==', code).fetch()
        return list[0]
    }

    async getNum(code: string):Promise<number>{
        const list = await this.inventoryDao.where('code', '==', code).fetch()
        return list[0].num
    }

    async update(code: string, num: number): Promise<number>{
        const date: ItemData = await this.getData(code)
        await this.inventoryDao.update({
            id: date.id,
            num: this.FieldValue.increment(num)
        })
        const resultData = await this.getData(code)
        return resultData.num
    }
}