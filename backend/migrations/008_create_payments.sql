IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='payments' AND xtype='U')
CREATE TABLE payments (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_id UNIQUEIDENTIFIER NOT NULL,
  payment_code NVARCHAR(30) NOT NULL,
  method NVARCHAR(30) NOT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(18,2) NOT NULL,
  currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
  provider NVARCHAR(50) NOT NULL,
  provider_transaction_id NVARCHAR(100) NULL,
  failure_reason NVARCHAR(500) NULL,
  paid_at DATETIME2 NULL,
  expired_at DATETIME2 NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  CONSTRAINT UQ_payments_payment_code UNIQUE (payment_code),
  CONSTRAINT FK_payments_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT CK_payments_method CHECK (method IN ('SANDBOX','BANK_TRANSFER')),
  CONSTRAINT CK_payments_status CHECK (status IN ('PENDING','PROCESSING','SUCCEEDED','FAILED','CANCELLED','EXPIRED'))
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_payments_order_id')
CREATE INDEX IX_payments_order_id ON payments(order_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_payments_status')
CREATE INDEX IX_payments_status ON payments(status);
