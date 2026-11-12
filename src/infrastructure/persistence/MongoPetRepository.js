import { MongoClient, ObjectId } from 'mongodb';

const COLLECTION = 'pets';

/** Abre a conexão com o MongoDB Atlas e cria os índices usados nas consultas. */
export async function connectMongo(uri, dbName) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, appName: 'vetflow-ms-pets' });
  await client.connect();
  const db = client.db(dbName);
  await db.collection(COLLECTION).createIndexes([
    { key: { tutorEmail: 1 }, name: 'pets_tutor_email' },
    { key: { species: 1 }, name: 'pets_species' },
    { key: { createdAt: -1 }, name: 'pets_created_at' }
  ]);
  return { client, db };
}

const toDomain = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toHexString(), ...rest };
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Adaptador da porta PetRepository para o MongoDB (um documento por pet, prontuário embutido). */
export class MongoPetRepository {
  constructor(db) {
    this.collection = db.collection(COLLECTION);
    this.db = db;
  }

  async insert(pet) {
    const { id, ...doc } = pet;
    const result = await this.collection.insertOne(doc);
    return { id: result.insertedId.toHexString(), ...doc };
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return toDomain(await this.collection.findOne({ _id: new ObjectId(id) }));
  }

  async list({ tutorEmail, species, search } = {}) {
    const query = {};
    if (tutorEmail) query.tutorEmail = tutorEmail;
    if (species) query.species = species;
    if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
    const docs = await this.collection.find(query).sort({ createdAt: -1 }).limit(200).toArray();
    return docs.map(toDomain);
  }

  async update(pet) {
    const { id, ...doc } = pet;
    await this.collection.replaceOne({ _id: new ObjectId(id) }, doc);
    return { id, ...doc };
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async ping() {
    await this.db.command({ ping: 1 });
    return true;
  }
}
