IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='status' AND xtype='U')
CREATE TABLE status (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(50) NOT NULL,
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(255) NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  deleted_date DATETIME2 NULL,
  CONSTRAINT UQ_status_code UNIQUE (code)
);
