import { MongoClient, ObjectId } from 'mongodb';

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

    async find(dbName, collectionName, query, sort = {}, project={}, limit = 10) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const queryObj = this.#convertParamToObjectIfNecessary(query);
        const sortObj = this.#convertParamToObjectIfNecessary(sort);
        const projectObj = this.#convertParamToObjectIfNecessary(project);
        return await collection.find(queryObj).limit(limit).sort(sortObj).project(projectObj).toArray();
    }

    async findOne(dbName, collectionName, query, projection={}) {
        await this.#connect();
        const db = this.#mongoClient.db(dbName);
        const collection = db.collection(collectionName);
        const queryObj = this.#convertParamToObjectIfNecessary(query);
        const projectionObj = this.#convertParamToObjectIfNecessary(projection);
        return await collection.findOne(queryObj, { projection: projectionObj });
    }

    async findById(dbName, collectionName, id, projection={}) {
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