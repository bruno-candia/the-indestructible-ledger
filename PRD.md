# 🏛️ PRD: The Indestructible Ledger

## 1. Project Overview & Context

**Goal:** Build the transactional core of a Fintech application capable of handling high-frequency financial events without data inconsistency.

**The Scenario:**
You are the Lead Engineer for a payment gateway integration. The system receives webhooks from providers (like Stripe) to credit/debit user wallets. The network is unreliable:

1.  **Duplicate Events:** The provider might send the same webhook (same Event ID) multiple times concurrently.
2.  **Race Conditions:** Two users might transfer funds to the same destination simultaneously.
3.  **Scalability Pressure:** The system is under heavy load (`100+ TPS` simulated).

**Success Metric:** Zero double-spending, zero negative balances, and strict "Exactly-Once" processing.

---

## 2. Functional Requirements

### 2.1. Wallet Management

- **Create Wallet:**
  - `POST /wallets`
  - Input: `{ owner_id: string }`
  - Output: `{ id: string, balance: 0, currency: 'BRL' }`
- **Get Balance:**
  - `GET /wallets/:id`
  - Output: `{ id: string, balance: number }`

### 2.2. Transactions (Deposit / Withdraw)

- **Process Transaction:**
  - `POST /transactions`
  - Input:
    ```json
    {
      "wallet_id": "uuid",
      "amount": 100.00,
      "type": "DEBIT" | "CREDIT",
      "idempotency_key": "unique-uuid-from-provider"
    }
    ```
  - Logic:
    - Must handle duplicate `idempotency_key` calls by returning the _original_ successful 200/201 response without re-processing.
    - Debits cannot result in negative balance.

### 2.3. Internal Transfers

- **Transfer Funds:**
  - `POST /transfers`
  - Input:
    ```json
    {
      "from_wallet_id": "uuid",
      "to_wallet_id": "uuid",
      "amount": 50.0
    }
    ```
  - Logic:
    - Atomicity is non-negotiable: If credit fails, debit must roll back.

---

## 3. Non-Functional Requirements (The Senior Bar)

### 3.1. Consistency & Concurrency

- **Aggressive Locking:** The system _must_ pass a load test where 10 concurrent requests try to withdraw more than the available balance. Only valid requests should succeed; the rest must fail gracefully.
- **Exactly-Once Processing:** Replaying a request with the same `idempotency_key` must NOT alter the balance a second time.

### 3.2. Reliability

- **Crash Recovery:** If the application crashes mid-transaction (after debit, before credit), the database must remain in a consistent state (via ACID conformant transactions).

### 3.3. Observability

- **Structured Logging:** Every log must share a `correlation_id` to trace the request flow.
- **Error Handling:** No generic "Internal Server Error". Return semantic errors (e.g., `INSUFFICIENT_FUNDS`, `CONCURRENCY_CONFLICT`).

---

## 4. Architectural Constraints

1.  **Language/Framework:** Node.js + NestJS (Opinionated).
2.  **Database:** PostgreSQL (Required).
3.  **Strict Mode:** TypeScript `strict: true` enabled.
4.  **No "Magic" Locking:** If utilizing an ORM (Prisma/TypeORM), you must explicitly demonstrate how you are handling locks (`SELECT FOR UPDATE` vs `Optimistic Concurrency`). Do not rely on default ORM behavior blindly.
5.  **Testing:** You must provide a script (e.g., `concurency-test.ts`) that spawns `Promise.all` to hammer your own API and prove it is thread-safe.

---

## 5. Deployment & Delivery

- **Docker:** (Optional but recommended) `docker-compose.yml` for the API and Postgres.
- **Timebox:** 4 Hours for Core Logic.

---

## 🛡️ The Defense Document (README.md Requirements)

You must include a section in your `README.md` answering these 5 questions to defend your implementation during the "code review":

1.  **Isolation Levels:** Which PostgreSQL transaction isolation level did you choose and why? (Read Committed vs Serializable).
2.  **Locking Strategy:** Did you use Pessimistic Locking (`FOR UPDATE`) or Optimistic Locking (Versioning)? Why is this the right choice for high-contention financial rows?
3.  **Idempotency Implementation:** How do you ensure the check for "Key Exists" and the "Insert Transaction" happens atomically?
4.  **Deadlock Prevention:** In a bi-directional transfer (A->B and B->A happening simultaneously), how does your code prevent database deadlocks?
5.  **Clean Architecture:** How did you decouple the "Transaction Logic" from the "HTTP Controller" to allow for future protocol changes (e.g., switching to gRPC)?
