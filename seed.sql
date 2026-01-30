CREATE TABLE IF NOT EXISTS wallets (
  id VARCHAR(255) PRIMARY KEY,
  balance INTEGER NOT NULL,
  version INTEGER NOT NULL
);

INSERT INTO wallets (id, balance, version) VALUES ('wallet-a', 1000, 1) ON CONFLICT DO NOTHING;
INSERT INTO wallets (id, balance, version) VALUES ('wallet-b', 0, 1) ON CONFLICT DO NOTHING;
