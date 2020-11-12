import {FirestoreSimple} from '@firestore-simple/admin'

interface ItemData{
    id: string,
    code: string,
    name: string,
    num: number,
    limit: number
}
const Inventory_PATH = 'Order'

export class OrderModel {
    orderDao: any
    FieldValue: any

    constructor(db: any,FieldValue: any) {
        const firestoreSimple = new FirestoreSimple(db)
        this.orderDao = firestoreSimple.collection<ItemData>({path: Inventory_PATH})
        this.FieldValue = FieldValue
    }

    async create(code: string, name: string, limit: number, num: number):Promise<string>{
        return await this.orderDao.add({code: code,name: name, limit: limit, num: num})
    }

    async delete(code: string){
        const targetDatas = await this.orderDao.where('code' , '==', code).fetch()
        const targetId = targetDatas[0].id
        await this.orderDao.delete(targetId)
    }

    async getList():Promise<ItemData[]>{
        return await this.orderDao.fetchAll()
    }

    async getData(code: string): Promise<ItemData>{
        const list = await this.orderDao.where('code','==', code).fetch()
        return list[0]
    }

    async getNum(code: string):Promise<number>{
        const list = await this.orderDao.where('code', '==', code).fetch()
        return list[0].num
    }

    async update(code: string, num: number): Promise<number>{
        const date: ItemData = await this.getData(code)
        await this.orderDao.update({
            id: date.id,
            num: this.FieldValue.increment(num)
        })
        const resultData = await this.getData(code)
        return resultData.num
    }
}