import { ObjectId } from "bson";
import { Document, Model } from "mongoose";

export function getId(obj: Document | ObjectId): string {
  return obj instanceof Document ? (obj as Document).id : (obj as ObjectId).toHexString();
}

export async function ensureDocumentsArray<D extends Document>(arr: Array<ObjectId | D>, retriever: (id: string) => Promise<D>): Promise<Array<D>> {
  const promises = arr.map(obj => obj instanceof ObjectId ? retriever(obj.toHexString()) : obj);
  return await Promise.all(promises as Array<any>);
}