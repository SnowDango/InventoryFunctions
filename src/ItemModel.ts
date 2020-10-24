import {FirestoreSimple} from '@firestore-simple/admin'
import e from "express";
import admin from "firebase-admin";
import FieldValue = admin.firestore.FieldValue;

interface ItemData{
    id: string,
    code: string,
    name: string,
    num: number
}

admin.initializeApp();
const firestore = admin.firestore()
const ROOT_PATH = 'Inventory'

const firestoreSimple = new FirestoreSimple(firestore)
const dao = firestoreSimple.collection<ItemData>({ path: ROOT_PATH})

export class database {

    static async add(req: e.Request): Promise<string> {
        const body = req.body
        return await dao.add({code: body.code, name: body.name, num: body.num})
    }

    static async getAll(req: e.Request): Promise<ItemData[]>{
        return await dao.fetchAll()
    }

    static async increase(req: e.Request): Promise<number | undefined>{
        const targetList = await dao.where('code', '==', req.body.code).fetch()
        const targetId = targetList[0].id
        await dao.update({
            id: targetId,
            num: FieldValue.increment(req.body.num)
        })
        const updateResult = await dao.fetch(targetId)
        return updateResult?.num
    }

    static async decrease(req: e.Request): Promise<number | undefined>{
        const targetList = await dao.where('code', '==', req.body.code).fetch()
        const targetId = targetList[0].id
        await dao.update({
            id: targetId,
            num: FieldValue.increment(-1 * req.body.num)
        })
        const updateResult = await dao.fetch(targetId)
        return updateResult?.num
    }



}