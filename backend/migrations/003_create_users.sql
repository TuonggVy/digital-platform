IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  full_name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  phone NVARCHAR(20) NULL,
  company NVARCHAR(255) NULL,
  tax_code NVARCHAR(50) NULL,
  address NVARCHAR(500) NULL,
  password_hash NVARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  status_id INT NOT NULL,
  refresh_token_hash NVARCHAR(255) NULL,
  refresh_token_expires_at DATETIME2 NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  deleted_date DATETIME2 NULL,
  CONSTRAINT UQ_users_email UNIQUE (email),
  CONSTRAINT FK_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT FK_users_status FOREIGN KEY (status_id) REFERENCES status(id)
);
