# Guida alla Contribuzione

Questo progetto utilizza [Semantic Release](https://github.com/semantic-release/semantic-release) per automatizzare il versionamento e il rilascio delle nuove versioni. Per questo motivo, i messaggi di commit devono seguire il formato [Conventional Commits](https://www.conventionalcommits.org/).

## Formato dei Messaggi di Commit

Ogni messaggio di commit deve avere questa struttura:

```
<tipo>(<scope>): <descrizione>

[corpo]

[footer]
```

### Tipo

Il tipo deve essere uno dei seguenti:

- **feat**: Una nuova funzionalità
- **fix**: Correzione di un bug
- **docs**: Modifiche alla documentazione
- **style**: Modifiche che non influenzano il codice (spazi, formattazione, ecc.)
- **refactor**: Modifiche al codice che non correggono bug né aggiungono funzionalità
- **perf**: Modifiche che migliorano le prestazioni
- **test**: Aggiunta o correzione di test
- **chore**: Modifiche al processo di build o a strumenti ausiliari

### Scope

Lo scope è opzionale e indica la parte del progetto a cui si riferisce il commit (ad esempio: api, frontend, database).

### Descrizione

La descrizione è una breve spiegazione delle modifiche. Deve essere scritta al presente, in minuscolo e senza punto finale.

### Corpo

Il corpo è opzionale e può contenere una spiegazione più dettagliata delle modifiche.

### Footer

Il footer è opzionale e può contenere riferimenti a issue o breaking changes.

## Esempi

```
feat(auth): implementato sistema di login con OAuth

fix(api): corretto bug nella validazione dei dati

docs: aggiornato README con istruzioni di installazione

refactor(frontend): migliorata organizzazione dei componenti

chore: aggiornate dipendenze
```

## Breaking Changes

Se un commit introduce breaking changes, deve essere indicato nel footer con `BREAKING CHANGE:` seguito da una descrizione, oppure aggiungendo `!` dopo il tipo/scope.

Esempio:

```
feat(api)!: cambiato formato delle risposte API

BREAKING CHANGE: Le API ora restituiscono dati in formato camelCase invece che snake_case
```

## Come utilizzare semantic-release

Il progetto è configurato per rilasciare automaticamente nuove versioni quando vengono pushati commit sul branch `main`. Le versioni vengono incrementate automaticamente in base ai tipi di commit:

- **fix** -> incrementa la patch version (1.0.0 -> 1.0.1)
- **feat** -> incrementa la minor version (1.0.0 -> 1.1.0)
- **BREAKING CHANGE** o **!** -> incrementa la major version (1.0.0 -> 2.0.0)

Semantic-release creerà automaticamente release su GitHub con il changelog generato dai messaggi di commit.
