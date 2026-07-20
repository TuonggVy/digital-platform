IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='password_reset_tokens' AND xtype='U')
CREATE TABLE password_reset_tokens (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  user_id UNIQUEIDENTIFIER NOT NULL,
  token_hash NVARCHAR(64) NOT NULL,
  expires_at DATETIME2 NOT NULL,
  used_at DATETIME2 NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_password_reset_tokens_token_hash')
CREATE INDEX IX_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_password_reset_tokens_user_id')
CREATE INDEX IX_password_reset_tokens_user_id ON password_reset_tokens(user_id);
