IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
CREATE TABLE products (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  category_id UNIQUEIDENTIFIER NOT NULL,
  sub_category NVARCHAR(100) NOT NULL,
  slug NVARCHAR(150) NOT NULL,
  sku NVARCHAR(100) NULL,
  name NVARCHAR(MAX) NOT NULL,
  short_description NVARCHAR(MAX) NULL,
  description NVARCHAR(MAX) NULL,
  icon NVARCHAR(100) NULL,
  badge NVARCHAR(MAX) NULL,
  starting_price DECIMAL(18,2) NOT NULL,
  currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
  billing_cycles NVARCHAR(MAX) NOT NULL,
  features NVARCHAR(MAX) NULL,
  benefits NVARCHAR(MAX) NULL,
  how_it_works NVARCHAR(MAX) NULL,
  suitable_for NVARCHAR(MAX) NULL,
  faqs NVARCHAR(MAX) NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  is_featured BIT NOT NULL DEFAULT 0,
  status_id INT NOT NULL,
  packages NVARCHAR(MAX) NOT NULL DEFAULT '[]',
  related_product_ids NVARCHAR(MAX) NOT NULL DEFAULT '[]',
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  deleted_date DATETIME2 NULL,
  CONSTRAINT UQ_products_slug UNIQUE (slug),
  CONSTRAINT FK_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT FK_products_status FOREIGN KEY (status_id) REFERENCES status(id)
);

-- SQL Server unique constraints only allow a single NULL, but `sku` is optional,
-- so uniqueness (when present) is enforced via a filtered index instead.
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_products_sku')
CREATE UNIQUE INDEX IX_products_sku ON products(sku) WHERE sku IS NOT NULL;
