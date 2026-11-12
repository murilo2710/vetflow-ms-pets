/** Caso de uso: listar pets (filtros opcionais por tutor, espécie e nome). */
export class ListPetsHandler {
  constructor({ petRepository }) {
    this.petRepository = petRepository;
  }

  async execute({ tutorEmail, species, search } = {}) {
    const filter = {};
    if (tutorEmail) filter.tutorEmail = String(tutorEmail).trim().toLowerCase();
    if (species) filter.species = String(species).trim().toUpperCase();
    if (search) filter.search = String(search).trim();
    const pets = await this.petRepository.list(filter);
    // A listagem devolve um resumo; o prontuário completo fica no GET /pets/{id}.
    return pets.map(({ records = [], ...pet }) => ({
      ...pet,
      recordsCount: records.length,
      lastVisit: records[0]?.date ?? null
    }));
  }
}
