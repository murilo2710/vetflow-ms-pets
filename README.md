# VetFlow · ms-pets (Serviço de Prontuário · MongoDB)

Microserviço 1 do VetFlow, plataforma para clínicas veterinárias. Cuida dos **pets** e do **prontuário** (atendimentos). Usa banco próprio no **MongoDB Atlas** (Database per Service) e só é acessado pelo **BFF**.

**Alunos:** Bernardo Vieira · Murilo Regnier
PUCPR · Engenharia de Software · Arquitetura e Soluções Cloud · PJBL Entrega 3

## Links (nuvem)

| Item | URL |
|---|---|
| API (Azure Container Apps) | `https://vetflow-ms-pets.<ambiente>.azurecontainerapps.io` |
| Swagger | `https://vetflow-ms-pets.<ambiente>.azurecontainerapps.io/docs/` |
| Imagem Docker Hub | `https://hub.docker.com/r/<usuario>/vetflow-ms-pets` |

## Arquitetura

Clean Architecture com Vertical Slice: cada caso de uso é uma feature com o mesmo nome no Application e no API.

```
src/
  domain/                      Entities: pet.js (regras do pet e do prontuário), errors.js
  application/
    ports.js                   Contratos: PetRepository, Clock, IdGenerator
    features/
      CreatePet/handler.js     Casos de uso (dependem só do domínio e das portas)
      ListPets/  GetPet/  UpdatePet/  DeletePet/  AddMedicalRecord/
  infrastructure/              MongoPetRepository, InMemoryPetRepository, config
  api/
    features/<Feature>/endpoint.js   Rota HTTP de cada feature (Express)
    http/                      CORS, log com correlation id, erros, Swagger
    app.js  openapi.js
  main.js                      Composition root: cria as implementações e injeta nos casos de uso
```

Regra de dependência: `api → application → domain` e `infrastructure → domain`. Só o `main.js` conhece a infraestrutura. Isso é verificado por **testes de arquitetura** (`tests/architecture`).

### Regras de negócio (domínio)
- Pet: nome (2 a 60 caracteres), espécie `DOG|CAT|OTHER`, tutor e e-mail obrigatórios; nascimento não pode ser futuro; peso entre 0 e 150 kg.
- Atendimento (RF10): veterinário e diagnóstico obrigatórios, data não pode ser futura, e o peso informado passa a ser o peso atual do pet. Histórico ordenado do mais recente para o mais antigo.

### Endpoints
| Método | Rota | Feature |
|---|---|---|
| GET | `/pets?tutorEmail=&species=&search=` | ListPets |
| POST | `/pets` | CreatePet |
| GET | `/pets/{id}` | GetPet |
| PUT | `/pets/{id}` | UpdatePet |
| DELETE | `/pets/{id}` | DeletePet |
| POST | `/pets/{id}/records` | AddMedicalRecord |
| GET | `/health`, `/docs/` | Saúde e Swagger |

## Tecnologias
Node.js 22 (ESM), Express 4, driver oficial `mongodb`, MongoDB Atlas (M0 free), Docker, GitHub Actions, `node:test`.

## Como rodar localmente

```bash
npm install
npm test                       # testes unitários + arquitetura
npm start                      # sem MONGODB_URI usa repositório em memória
# com Atlas:
MONGODB_URI="mongodb+srv://..." npm start      # http://localhost:3001/docs/
```

Variáveis em `.env.example`. Com `NODE_ENV=production` (padrão da imagem Docker) o serviço não sobe sem `MONGODB_URI`.

## Docker

```bash
docker build -t <usuario-dockerhub>/vetflow-ms-pets:v1 .
docker login
docker push <usuario-dockerhub>/vetflow-ms-pets:v1
docker run -p 3001:3001 -e MONGODB_URI="mongodb+srv://..." <usuario-dockerhub>/vetflow-ms-pets:v1
```

O workflow `.github/workflows/ci.yml` roda os testes e publica a imagem no Docker Hub a cada push na `main` quando os secrets `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN` estão configurados.
