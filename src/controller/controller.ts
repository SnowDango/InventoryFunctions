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

    async create(req: e.Request){
        const body = req.body
        const code = body.code
        const num = body.num
        const limit = body.limit
        const name = body.name
        await this.inventoryModel.create(code, name, limit, num)
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

    async increment(req: e.Request):Promise<{num: number,new_place: number}>{
        try {
            const body = req.body
            const place = await this.searchPlace(body.code)
            if (place === 0) {
                const item = await this.inventoryModel.getData(body.code)
                await this.inventoryModel.update(body.code, body.num)
                const newPlace = await this.checkNum(place, body.code)
                return {new_place: newPlace, num: item.num + body.num}
            } else if (place === 1) {
                const item = await this.orderModel.getData(body.code)
                await this.orderModel.update(body.code, body.num)
                const newPlace = await this.checkNum(place, body.code)
                return {new_place: newPlace, num: item.num + body.num}
            } else {
                return {new_place: -1, num: -1}
            }
        }catch (e) {
            log(e)
            return {new_place: -1, num: -1}
        }
    }

    async decrement(req: e.Request):Promise<{num: number,new_place: number}>{
        const body = req.body
        const place: number = await this.searchPlace(body.code)
        if(place === 0){
            const item = await this.inventoryModel.getData(body.code)
            await this.inventoryModel.update(body.code,-1*body.num)
            const newPlace: number = await this.checkNum(place,body.code)
            return {new_place: newPlace, num: item.num - body.num}
        }else if(place === 1){
            const item = await this.orderModel.getData(body.code)
            await this.orderModel.update(body.code,-1*body.num)
            const newPlace = await this.checkNum(place,body.code)
            return {new_place: newPlace, num: item.num - body.num}
        }else{
            return {new_place: -1, num: -1}
        }
    }

    async searchPlace(code: string):Promise<number>{
        try {
            const inventoryList = await this.inventoryModel.getData(code)
            const orderList = await this.orderModel.getData(code)
            if (inventoryList !== undefined) {
                return 0
            } else if (orderList !== undefined) {
                return 1
            } else {
                return -1
            }
        }catch (e) {
            log(e)
            return -1
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