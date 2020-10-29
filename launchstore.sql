DROP DATABASE IF EXISTS launchstore;
CREATE DATABASE launchstore;

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "category_id" int NOT NULL,
  "user_id" int,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" int,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "status" int DEFAULT 1,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

-- add categories
INSERT INTO categories(name) VALUES ('Comida');
INSERT INTO categories(name) VALUES ('Eletrônicos');
INSERT INTO categories(name) VALUES ('Automóveis');
INSERT INTO categories(name) VALUES ('Casa');
INSERT INTO categories(name) VALUES ('Jardim');
INSERT INTO categories(name) VALUES ('Computadores');
INSERT INTO categories(name) VALUES ('Bicicletas');

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL,
  "product_id" int 
);

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" text,
  "address" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- create procedure

CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- auto update_at products

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- auto update_at users

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- connect-pg-simple table

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- token password recovery

ALTER TABLE users ADD COLUMN reset_token text;
ALTER TABLE users ADD COLUMN reset_token_expires text;

-- cascade effect when delete user and products

ALTER TABLE products
DROP CONSTRAINT products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE files
DROP CONSTRAINT files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey
FOREIGN KEY ("product_id")
REFERENCES "products" ("id")
ON DELETE CASCADE;

-- to run seeds
DELETE FROM users;
DELETE FROM products;
DELETE FROM files;

-- restart sequence auto_increment from tables ids
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;

-- create orders
CREATE TABLE "orders" (
	"id" SERIAL PRIMARY KEY,
  "seller_id" int NOT NULL,
  "buyer_id" int NOT NULL,
  "product_id" int NOT NULL,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "total" int NOT NULL, 
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

ALTER TABLE "orders" ADD FOREIGN KEY ("seller_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

-- Soft delete
-- 1. Create a column in the product table called deleted_at
ALTER TABLE products ADD COLUMN "deleted_at" timestamp;

-- 2. Create a rule that will be used every time we call delete
CREATE OR REPLACE RULE delete_product AS
ON DELETE TO products DO INSTEAD 
UPDATE products
SET deleted_at = now()
WHERE products.id = old.id;

-- 3. Create a VIEW that will pull only the active data

CREATE VIEW products AS 
SELECT * FROM products_with_deleted WHERE deleted_at IS NULL;

-- 4. Rename view and table

ALTER TABLE products RENAME TO products_with_deleted;