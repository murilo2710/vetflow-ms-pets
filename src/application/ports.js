// Portas (contratos) que os casos de uso recebem por injeção de dependência.
// Em JavaScript não existe "interface": cada implementação (Mongo, memória ou fake de teste)
// precisa ter exatamente estes métodos. Os testes de arquitetura garantem que a camada
// Application não importa nenhuma implementação concreta.

/**
 * @typedef {Object} PetRepository
 * @property {(pet: object) => Promise<object>} insert          Grava e devolve o pet com id
 * @property {(id: string) => Promise<object|null>} findById
 * @property {(filter: {tutorEmail?: string, species?: string, search?: string}) => Promise<object[]>} list
 * @property {(pet: object) => Promise<object>} update
 * @property {(id: string) => Promise<boolean>} delete
 */

/**
 * @typedef {Object} Clock
 * @property {() => Date} now
 */

/**
 * @typedef {Object} IdGenerator
 * @property {() => string} newId
 */

export const PORTS = Object.freeze(['petRepository', 'clock', 'idGenerator']);
