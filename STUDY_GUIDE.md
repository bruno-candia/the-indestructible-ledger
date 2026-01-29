### 📚 1. Para dominar Concorrência e Locking (O Core do Desafio)

_O maior risco do seu projeto é o "Double Spending". Estes recursos ensinam como o banco de dados te salva quando o Node.js não consegue._

**📖 Leitura Obrigatória (Deep Dive):**

- **PostgreSQL Documentation: Explicit Locking**
- _Por que ler:_ É a fonte da verdade. Foque em entender a diferença entre `ROW SHARE` e `ACCESS EXCLUSIVE`. Você precisará saber exatamente qual lock o Postgres aplica _automaticamente_ num `UPDATE` vs o que você precisa aplicar _manualmente_ (`SELECT FOR UPDATE`).

- **"No Dirty Reads: The Guide to Isolation Levels" (CockroachDB Blog)**
- _Por que ler:_ Explica de forma visual a diferença entre _Read Committed_ (padrão do Postgres) e _Serializable_. Essencial para responder à Pergunta 1 do seu Defense Document.

**🎥 Visual Mental Models (YouTube):**

- **Hussein Nasser: "Pessimistic vs Optimistic Concurrency Control"**
- _O que buscar:_ Ele desenha o fluxo de transações. Entenda o trade-off: Pessimistic trava o banco (menos throughput, mais segurança), Optimistic falha na hora do commit (mais throughput, exige retry complexo).

- **"All Postgres Locks Explained" (Hussein Nasser)**
- _Deep Dive:_ Uma aula de 48 minutos. Assista aos trechos sobre **Row-Level Locks** e **Deadlocks**. Vai te salvar de travar o banco em produção.

---

### 🔄 2. Para garantir Idempotência (Exactly-Once)

_Como evitar processar o mesmo pagamento duas vezes quando a API recebe um "burst" de retentativas._

**📖 Artigos de Engenharia (Best Practices):**

- **"Implementing Idempotency Keys in REST APIs" (Zuplo / Stripe Engineering Blog)**
- _Conceito Chave:_ O padrão "Check-then-Act" atômico. Você não pode apenas fazer `if (exists) return`. Você precisa inserir a chave de idempotência com uma constraint `UNIQUE` no banco _dentro da mesma transação_ do pagamento.

- **"Idempotency in Distributed Systems" (Arpit Bhayani)**
- _Foco:_ Arpit é excelente em System Design. Ele explica como lidar com falhas de rede durante o envio da resposta (o servidor processou, mas o cliente não recebeu o OK).

---

### 🏎️ 3. Node.js & Race Conditions

_O Node.js é "single-threaded", mas isso não te protege de Race Conditions. Entenda por quê._

**📖 O Perigo Invisível:**

- **"Node.js Race Conditions" (Node.js Design Patterns)**
- _O Insight:_ Mostra como o `await` quebra a atomicidade da função. Se você tem:

```javascript
const balance = await getBalance();
// <-- OUTRA REQUISIÇÃO PODE RODAR AQUI
await updateBalance(balance - amount);
```

Você acabou de criar um bug crítico.

**🎥 NestJS Específico:**

- **"Unit of Work no Nest.js: Controle total de transações" (Full Cycle / Otávio Lemos)**
- _Prático:_ Mostra como implementar o padrão _Unit of Work_ ou gerenciar o `TransactionRunner` do TypeORM/Prisma de forma limpa, sem sujar todos os seus Services com `queryRunner`.

- **"NestJS Transactions Best Practices"**
- _Foco:_ Como usar Interceptors ou Decorators para gerenciar transações de forma declarativa (ex: `@Transactional()`), algo muito comum em nível Senior/Staff.

---

### 🕵️ 4. Observabilidade & "Defense"

_Como provar que seu sistema funciona e debugar quando falha._

- **OpenTelemetry for Node.js (Guide 2025/2026)**
- _Aplicação:_ Não use apenas `console.log`. Use _Distributed Tracing_ para gerar um `trace_id` que acompanha a requisição desde o Controller -> Service -> Banco de Dados. Isso é vital para responder à pergunta sobre "Observability" no desafio.

---

### 🎯 Plano de Estudo (Fast Track)

Para não perder tempo, sugiro esta ordem:

1. **Vídeo:** Hussein Nasser sobre "Pessimistic vs Optimistic" (15 min) -> _Define sua estratégia de arquitetura._
2. **Leitura:** Artigo sobre "Node.js Race Conditions" -> _Evita o erro clássico do `await`._
3. **Documentação:** Postgres Locking -> _Para implementar a query SQL correta._

Está pronto para aplicar isso no código?

🔐 1. Database Locking & Concurrency (O Coração do Lab)
Documentação Oficial (PostgreSQL): Explicit Locking

🔗 https://www.postgresql.org/docs/current/explicit-locking.html

O que buscar: A tabela de conflitos (Table-level Lock Modes) e a seção sobre "Row-Level Locks" (especificamente FOR UPDATE).

Artigo: "Node.js Race Conditions" (Node.js Design Patterns)

🔗 https://nodejsdesignpatterns.com/blog/node-js-race-conditions/

Por que ler: É a melhor explicação visual de como o await "pausa" sua função e permite que outra requisição altere o estado do banco pelas suas costas.

Vídeo: "All Postgres Locks Explained" (Hussein Nasser)

🔗 Busque no YouTube por: Hussein Nasser All Postgres Locks Explained (aprox. 45 min)

Contexto: Hussein é referência mundial em engenharia de backend. Ele desenha exatamente o que acontece na memória do banco quando você dá um Lock.

Artigo: Isolation Levels & Consistency (CockroachDB Blog)

🔗 https://www.cockroachlabs.com/blog/db-consistency-isolation-terminology/

Por que ler: Embora seja do CockroachDB, a explicação visual sobre Snapshot Isolation vs Serializable é universal para SQL. Essencial para o seu "Defense Document".

🔄 2. Idempotency & Arquitetura Robusta
Stripe Engineering Blog: Designing Robust APIs (Idempotency)

🔗 https://stripe.com/blog/idempotency

A Bíblia: Este é o artigo que definiu o padrão da indústria para chaves de idempotência. Leia a seção sobre "The Client-Server contract".

NestJS Docs: Database Transactions

🔗 https://docs.nestjs.com/techniques/database

Prática: Se estiver usando TypeORM ou Prisma, vá direto para a seção de transações manuais. Você precisará controlar o COMMIT e ROLLBACK explicitamente.

🕵️ 3. Observabilidade
OpenTelemetry for Node.js (Getting Started)

🔗 https://opentelemetry.io/docs/languages/js/getting-started/nodejs/

Foco: Não perca tempo configurando dashboards complexos agora. Foque em conseguir gerar um "Trace" que mostre: Controller -> Service -> Database Query.
