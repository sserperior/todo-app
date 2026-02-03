import { MongoClient, ObjectId } from 'mongodb';
import { nanoid } from 'nanoid';

class DBConnector {
    #mongoUri;
    #mongoClient;

    constructor(mongoUri) {
        this.#mongoUri = mongoUri;
        this.#mongoClient = null;
    }

    async #connect() {
        if (this.#mongoClient == null) {
            this.#mongoClient = new MongoClient(this.#mongoUri);
            await this.#mongoClient.connect();
            console.log('Connected successfully to MongoDB server.');
        }
    }

    #convertParamToObjectIfNecessary(param) {
        return param && typeof param === 'object' ? param : {};
    }

    async disconnect() {
        if (this.#mongoClient != null) {
            await this.#mongoClient.close();
            this.#mongoClient = null;
            console.log('Disconnected from MongoDB server.');
        }
    }

    async createIndex(dbName, collectionName, indexName, indexFields, options = {}) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const indexFieldsObj = this.#convertParamToObjectIfNecessary(indexFields);
        const optionsObj = this.#convertParamToObjectIfNecessary(options);
        return await collection.createIndex(indexFieldsObj, { name: indexName, ...optionsObj });
    }

    async insertOne(dbName, collectionName, document) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        return await collection.insertOne(document);
    }

    async find(dbName, collectionName, query, sort = {}, project = {}, limit = 10) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const queryObj = this.#convertParamToObjectIfNecessary(query);
        const sortObj = this.#convertParamToObjectIfNecessary(sort);
        const projectObj = this.#convertParamToObjectIfNecessary(project);
        return await collection.find(queryObj).limit(limit).sort(sortObj).project(projectObj).toArray();
    }

    async findOne(dbName, collectionName, query, projection = {}) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const queryObj = this.#convertParamToObjectIfNecessary(query);
        const projectionObj = this.#convertParamToObjectIfNecessary(projection);
        return await collection.findOne(queryObj, { projection: projectionObj });
    }

    /**
     * @param {ObjectId} docId - The ID of the document containing the 'items' array
     * @param {Array} ops - Array of operations: { type: 'append'|'modify'|'remove', payload: { id, lastModified, ... } }
     */
    async syncItems(dbName, collectionName, docId, ops) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const bulkOps = ops.map(({ type, payload }) => {
            const lastModified = new Date();
            switch (type) {
                case 'append':
                    const newId = nanoid();
                    return {
                        updateOne: {
                            // Only push if the ID doesn't already exist in the items array
                            filter: { _id: new ObjectId(docId), "items.id": { $ne: newId } },
                            update: { $push: { items: { id: newId, ...payload, lastModified: new Date() } } }
                        }
                    };
                case 'modify':
                    const { id, ...changes } = payload;
                    const setOp = {
                        'items.$[elem].lastModified': lastModified,
                    };
                    for (const key in changes) {
                        setOp[`items.$[elem].${key}`] = changes[key];
                    }
                    return {
                        updateOne: {
                            filter: { _id: new ObjectId(docId) },
                            // Update only the specific element caught by the arrayFilter
                            update: { $set: setOp },
                            arrayFilters: [{
                                "elem.id": id,
                                "elem.lastModified": { $lt: lastModified } // Timestamp Gatekeeper
                            }]
                        }
                    };
                case 'remove':
                    const deletedId = payload.id;
                    return {
                        updateOne: {
                            filter: { _id: new ObjectId(docId) },
                            // Only remove if the current version in DB is older than the delete request
                            update: { $pull: { items: { id: deletedId, lastModified: { $lt: lastModified } } } }
                        }
                    };
            }
        });

        // Use { ordered: true } to ensure operations happen in the sequence provided
        return await collection.bulkWrite(bulkOps, { ordered: true });
    }


    async findById(dbName, collectionName, id, projection = {}) {
        const projectionObj = this.#convertParamToObjectIfNecessary(projection);
        return await this.findOne(dbName, collectionName, { _id: new ObjectId(id) }, projectionObj);
    }

    async updateOne(dbName, collectionName, query, update) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        return await collection.updateOne(query, update);
    }
};

export default DBConnector;