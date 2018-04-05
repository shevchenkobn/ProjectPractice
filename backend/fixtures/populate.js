if (require.main != module) {
  throw new Error("This module is command line only!");
}

const objectIdPrefix = 'ObjectId: ';
const collectionExt = '.json';

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { host, port, dbName } = require('config').get('mongodb');

const mongoUrl = `${host}:${port}`;
const dirPath = process.argv[2];
if (!dirPath) {
  throw new Error('Path to directory with JSONs must be specified');
}

(async () => {

  const client = await MongoClient.connect(mongoUrl);
  try {
    const readDir = promisify(fs.readdir);
    const fileNames = (await readDir(dirPath)).filter(name => name.endsWith(collectionExt));

    const fixtures = {};
    const collectionNames = []
    for (let fileName of fileNames) {
      const name = makeCollectionName(fileName);
      fixtures[name] = require(path.resolve(dirPath, fileName));
      collectionNames.push(name);
    }

    const db = client.db(dbName);
    const collections = {};
    const tasks = [];
    for (let collectionName of collectionNames) {
      const collection = db.collection(collectionName);
      collections[collectionName] = collection;
      tasks.push(collection.deleteMany({}));
    }
    await Promise.all(tasks);
    tasks.length = 0;

    const idMap = {};
    for (let collectionName of collectionNames) {
      const fixture = fixtures[collectionName];
      if (!Array.isArray(fixture)) {
        throw new Error(`Fixture "${collectionName}" is not an array`);
      }
      for (let entity of fixture) {
        const id = entity._id;
        if (id in idMap) {
          throw new Error(`ObjectId "${id}" has duplicate definitions in "${collectionName}"`);
        }
        const _id = await insertDocumentAndGetId(collections[collectionName], getNoIdEntity(entity));
        idMap[id] = _id;
        entity._id = _id;
      }
    }

    resolveFixtures(fixtures, idMap, collectionNames);

    for (let collectionName of collectionNames) {
      const collection = collections[collectionName];
      const fixture = fixtures[collectionName];

      for (let entity of fixture) {
        tasks.push(collection.findOneAndReplace({ _id: entity._id }, entity));
      }
    }
    await Promise.all(tasks);
    console.log('Everything is done, bye :)');
  } catch (err) {
    throw err;
  } finally {
    await client.close();
  }

})().catch(err => {
  console.error(err);
  process.exit(1);
});

// Helper function

function getNoIdEntity(entity) {
  const newEntity = JSON.parse(JSON.stringify(entity));
  delete newEntity._id;
  return newEntity;
}

function makeCollectionName(filePath) {
  filePath = path.basename(filePath);
  const lastPoint = filePath.lastIndexOf(collectionExt);
  return filePath.slice(0, lastPoint);
}

async function insertDocumentAndGetId(collection, entity) {
  const { insertedId } = await collection.insertOne(entity);
  return insertedId;
}

function resolveFixtures(fixtures, idMap, collectionNames = Object.getOwnPropertyNames(fixtures)) {
  for (let collectionName of Object.getOwnPropertyNames(fixtures)) {
    const fixture = fixtures[collectionName];
    for (let entity of fixture) {
      resolveObject(entity, idMap);
    }
  }
}

function resolveObject(obj, idMap) {
  const ownProps = Object.getOwnPropertyNames(obj);
  for (let prop of ownProps) {
    resolveAny(obj, prop, idMap);
  }
}

function resolveAny(obj, prop, idMap) {
  const propType = typeof obj[prop];
  switch (propType) {
    case 'string':
      if (obj[prop].startsWith(objectIdPrefix)) {
        const id = obj[prop];
        if (!(id in idMap)) {
          throw new Error(`Can't resolve ObjectId "${id}"`);
        }
        obj[prop] = idMap[id];
      }
      break;
    case 'object':
      if (Array.isArray(obj[prop])) {
        resolveArray(obj[prop], idMap);
      } else {
        resolveObject(obj[prop], idMap);
      }
  }
}

function resolveArray(arr, idMap) {
  for (let i = 0; i < arr.length; i++) {
    resolveAny(arr, i, idMap);
  }
}