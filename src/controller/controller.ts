import e from "express"
import admin from "firebase-admin";
import {InventoryModel} from "../model/InventoryModel";
import {OrderModel} from "../model/OrderModel";
import {log} from "firebase-functions/lib/logger";
import {ItemData} from "../utility/ItemData";

admin.initializeApp()
const firestore = admin.firestore()
const FieldValue = admin.firestore.FieldValue

export class Controller {

    inventoryModel = new InventoryModel(firestore,FieldValue)
    orderModel = new OrderModel(firestore,FieldValue)

    async create(req: e.Request):Promise<{id:string,code:string,name:string,num:string,limit:string}> {
        const body = req.body
        const code = body.code
        const num = body.num
        const limit = body.limit
        const name = body.name
        const id = await this.inventoryModel.create(code, name, limit, num)
        return {id:id,code:code,name:name,num:num,limit:limit}
    }


    async createOrder(req: e.Request){
        const body = req.body
        const code = body.code
        const num = body.num
        const limit = body.limit
        const name = body.name
        await this.orderModel.create(code,name,limit,num)
    }

    async getAll():Promise<string>{
        const orderList: ItemData[] = await this.orderModel.getList()
        const inventoryList: ItemData[] = await this.inventoryModel.getList()
        const json = {'inventory':inventoryList,'order': orderList}
        return JSON.stringify(json)
    }

    async increment(req: e.Request):Promise<boolean>{
        try {
            const body = req.body
            const place = await this.searchPlace(body.code) // inventoryにあるかorderにあるか
            if(place.inventoryExist){
                await this.inventoryModel.getData(body.code)
                await this.inventoryModel.update(body.code,body.num)
            }
            if(place.orderExist){
                const item = await this.orderModel.getData(body.code)
                if(item.num + body.num > item.limit){
                    await this.orderModel.delete(body.code)
                }else{
                    await this.orderModel.update(body.code,body.num)
                }
            }
            return true
        }catch (e) {
            log(e)
            return false
        }
    }

    async decrement(req: e.Request):Promise<boolean>{
        try {
            const body = req.body
            const place = await this.searchPlace(body.code) // inventoryにあるかorderにあるか
            if (place.inventoryExist) {
                const item = await this.inventoryModel.getData(body.code)
                if(item.num-body.num <= 0){
                    await this.inventoryModel.delete(body.code)
                }else{
                    if(item.num-body.num <= item.limit){
                        await this.orderModel.create(item.code,item.name,item.limit,item.num-body.num)
                    }
                    await this.inventoryModel.update(body.code,-1*body.num)
                }
            }
            if(place.orderExist){
                const item = await this.orderModel.getData(body.code)
                if(item.limit < item.num-body.num){
                    await this.orderModel.delete(body.code)
                }else{
                    await this.orderModel.update(body.code,-1*body.num)
                }
            }
            return true
        }catch (e) {
            log(e)
            return false
        }
    }

    async searchPlace(code: string):Promise<{inventoryExist: boolean,orderExist: boolean}>{
        try{
            const returnData = {inventoryExist: false,orderExist: false}
            const inventory = await this.inventoryModel.getData(code)
            const order = await this.orderModel.getData(code)
            returnData.inventoryExist = inventory !== undefined;
            returnData.orderExist = order !== undefined;
            return returnData
        }catch (e) {
            return {inventoryExist: false,orderExist: false}
        }
    }

    async checkNum(place: number, code: string):Promise<number>{
        if(place === 0) {
            const data = await this.inventoryModel.getData(code)
            if (data.num === 0) {
                await this.inventoryModel.getData(data.id)
                return -2
            } else if (data.num <= data.limit) {
                await this.inventoryModel.delete(code)
                await this.orderModel.create(data.code, data.name, data.limit, data.num)
                return 1
            }
        }else if(place === 1){
            const data = await this.orderModel.getData(code)
            if(data.num === 0) {
                await this.orderModel.delete(data.code)
                return -2
            }else if(data.num > data.limit){
                await this.orderModel.delete(code)
                await this.inventoryModel.create(data.code,data.name,data.limit,data.num)
                return 0
            }
        }
        return place
    }
}