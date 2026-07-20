IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
CREATE TABLE categories (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  name NVARCHAR(MAX) NOT NULL,
  slug NVARCHAR(100) NOT NULL,
  code NVARCHAR(50) NOT NULL,
  description NVARCHAR(MAX) NULL,
  status_id INT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  deleted_date DATETIME2 NULL,
  CONSTRAINT UQ_categories_slug UNIQUE (slug),
  CONSTRAINT UQ_categories_code UNIQUE (code),
  CONSTRAINT FK_categories_status FOREIGN KEY (status_id) REFERENCES status(id)
);
