// Documentação OpenAPI 3 do Serviço de Prontuário (Swagger em /docs).
const error = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'validation' },
        message: { type: 'string', example: 'Dados do pet inválidos' },
        details: { type: 'object', additionalProperties: { type: 'string' } }
      }
    }
  }
};

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string', example: '6733a1f0c2b4e5a1d2f3a4b5' } };
const responses = (ok, okSchema, extra = {}) => ({
  [ok]: { description: 'Sucesso', content: okSchema ? { 'application/json': { schema: okSchema } } : undefined },
  ...extra
});
const err = (description) => ({ description, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } });

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'VetFlow - Serviço de Prontuário (ms-pets)',
    version: '1.0.0',
    description: 'Microserviço de pets e prontuário do VetFlow. Banco: MongoDB Atlas (database per service). ' +
      'Clean Architecture + Vertical Slice. Autores: Bernardo Vieira e Murilo Regnier.'
  },
  servers: [{ url: '/', description: 'Este servidor' }],
  tags: [{ name: 'Pets' }, { name: 'Prontuário' }, { name: 'Health' }],
  paths: {
    '/pets': {
      get: {
        tags: ['Pets'], summary: 'Listar pets (ListPets)',
        parameters: [
          { name: 'tutorEmail', in: 'query', schema: { type: 'string' } },
          { name: 'species', in: 'query', schema: { type: 'string', enum: ['DOG', 'CAT', 'OTHER'] } },
          { name: 'search', in: 'query', description: 'Parte do nome do pet', schema: { type: 'string' } }
        ],
        responses: responses(200, { type: 'array', items: { $ref: '#/components/schemas/PetSummary' } })
      },
      post: {
        tags: ['Pets'], summary: 'Cadastrar pet (CreatePet)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PetInput' } } } },
        responses: responses(201, { $ref: '#/components/schemas/Pet' }, { 400: err('Dados inválidos') })
      }
    },
    '/pets/{id}': {
      get: {
        tags: ['Pets'], summary: 'Ficha do pet com prontuário (GetPet)', parameters: [idParam],
        responses: responses(200, { $ref: '#/components/schemas/Pet' }, { 404: err('Pet não encontrado') })
      },
      put: {
        tags: ['Pets'], summary: 'Atualizar cadastro (UpdatePet)', parameters: [idParam],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PetInput' } } } },
        responses: responses(200, { $ref: '#/components/schemas/Pet' }, { 400: err('Dados inválidos'), 404: err('Pet não encontrado') })
      },
      delete: {
        tags: ['Pets'], summary: 'Remover pet (DeletePet)', parameters: [idParam],
        responses: { 204: { description: 'Removido' }, 404: err('Pet não encontrado') }
      }
    },
    '/pets/{id}/records': {
      post: {
        tags: ['Prontuário'], summary: 'Registrar atendimento no prontuário (AddMedicalRecord)', parameters: [idParam],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicalRecordInput' } } } },
        responses: responses(201, {
          type: 'object',
          properties: { record: { $ref: '#/components/schemas/MedicalRecord' }, pet: { $ref: '#/components/schemas/Pet' } }
        }, { 400: err('Dados inválidos'), 404: err('Pet não encontrado') })
      }
    },
    '/health': {
      get: { tags: ['Health'], summary: 'Saúde do serviço e do MongoDB', responses: { 200: { description: 'OK' }, 503: { description: 'Banco indisponível' } } }
    }
  },
  components: {
    schemas: {
      Error: error,
      PetInput: {
        type: 'object',
        required: ['name', 'species', 'tutorName', 'tutorEmail'],
        properties: {
          name: { type: 'string', example: 'Thor' },
          species: { type: 'string', enum: ['DOG', 'CAT', 'OTHER'], example: 'DOG' },
          breed: { type: 'string', example: 'Golden Retriever' },
          birthDate: { type: 'string', format: 'date', example: '2021-03-10' },
          weightKg: { type: 'number', example: 28.5 },
          tutorName: { type: 'string', example: 'Ana Souza' },
          tutorEmail: { type: 'string', format: 'email', example: 'ana@email.com' }
        }
      },
      MedicalRecordInput: {
        type: 'object',
        required: ['vetName', 'diagnosis'],
        properties: {
          date: { type: 'string', format: 'date-time' },
          vetName: { type: 'string', example: 'Dra. Carla Mendes' },
          diagnosis: { type: 'string', example: 'Otite externa leve' },
          prescription: { type: 'string', example: 'Limpeza auricular 2x ao dia por 7 dias' },
          weightKg: { type: 'number', example: 29.1 },
          appointmentId: { type: 'string', example: '42' }
        }
      },
      MedicalRecord: {
        allOf: [{ $ref: '#/components/schemas/MedicalRecordInput' }, { type: 'object', properties: { id: { type: 'string' } } }]
      },
      Pet: {
        allOf: [
          { $ref: '#/components/schemas/PetInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'string' },
              records: { type: 'array', items: { $ref: '#/components/schemas/MedicalRecord' } },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        ]
      },
      PetSummary: {
        allOf: [
          { $ref: '#/components/schemas/PetInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'string' },
              recordsCount: { type: 'integer' },
              lastVisit: { type: 'string', format: 'date-time', nullable: true }
            }
          }
        ]
      }
    }
  }
};
