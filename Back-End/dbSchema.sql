CREATE TABLE "language" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(2) NOT NULL
);

-- we make this table to destinct between tables that need translation
CREATE TABLE "entity" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL UNIQUE -- search of name of entity is frequently
);

CREATE TABLE "translation" (
  "entity_id" SMALLINT,   -- define the table
  "entity_key" INT,      -- define primary key of table
  "lang_id" SMALLINT,
  "column_name" VARCHAR(30),  -- define the column of table, because there are some tables have at least two columns need to be translated
  "text" TEXT NOT NULL,
  PRIMARY KEY("entity_id","entity_key","column_name","lang_id"),  -- the order is important
  CONSTRAINT "FK_translation_language"
    FOREIGN KEY ("lang_id")
      REFERENCES "language"("id"),
  CONSTRAINT "FK_translation_entity"
    FOREIGN KEY ("entity_id")
      REFERENCES "entity"("id")
);

CREATE TABLE "country"(
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(15) NOT NULL
);

CREATE TABLE "region"(
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL,
  "country_id" SMALLINT NOT NULL,
  CONSTRAINT "FK_region_country"
    FOREIGN KEY ("country_id")
      REFERENCES "country"("id")
);

CREATE TABLE "city" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL,
  "region_id" INT NOT NULL,
  CONSTRAINT "FK_city_region"
    FOREIGN KEY ("region_id")
      REFERENCES "region"("id"),
  CONSTRAINT "unique_regionID_cityName" -- optimize query of list all cities situated in the same region
  UNIQUE ("region_id","name")
);

CREATE TABLE "address" (
  "id" SERIAL PRIMARY KEY,
  "region_id" INT NOT NULL, -- we let region_id because city_id can be null, so we can determine region & country
  "city_id" INT,
  "street" VARCHAR(100),
  "adress_number" INT,
  "postal_code" INT,
  CONSTRAINT "FK_address_city"
    FOREIGN KEY ("city_id")
      REFERENCES "city"("id"),
  CONSTRAINT "FK_address_region"
    FOREIGN KEY ("region_id")
      REFERENCES "region"("id")
);

CREATE TABLE "role" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);

CREATE TYPE sex_enum AS ENUM('male','female');

CREATE TABLE "sex" (
  "id" smallserial PRIMARY KEY,
  "name" sex_enum NOT NULL
);

CREATE TABLE "phone_ext" (
  "extension" smallint PRIMARY KEY,
  "country_id" smallint NOT NULL,
  CONSTRAINT "FK_phone-ext_country"
    FOREIGN KEY("country_id")
      REFERENCES "country"("id")
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- enable the function that generate uuid randomly

CREATE TABLE "user" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "phone_number" INTEGER UNIQUE NOT NULL,
  "email" VARCHAR(254) UNIQUE,
  -- the qeury of check if phone number or email are already used is frequently
  "password" VARCHAR(60) NOT NULL,   -- 60 character to generate password with bcrypt library
  "firstname" VARCHAR(20) NOT NULL,
  "lastname" VARCHAR(20) NOT NULL,
  "sex" SMALLINT NOT NULL,
  "age" SMALLINT NOT NULL,
  "address" INT NOT NULL,
  "role_id" SMALLINT NOT NULL,
  "registration_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "profile_image" VARCHAR(100),
  CONSTRAINT "unique_username"
  UNIQUE ("firstname","lastname"), -- query of check if username is already used is frequently
  CONSTRAINT "FK_user_address"
    FOREIGN KEY ("address")
      REFERENCES "address"("id"),
  CONSTRAINT "FK_user_role"
    FOREIGN KEY ("role_id")
      REFERENCES "role"("id"),
  CONSTRAINT "FK_user_sex"
    FOREIGN KEY ("sex")
      REFERENCES "sex"("id")
);

CREATE TABLE "worker" (
  "id" UUID PRIMARY KEY,
  "registration_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "bio" TEXT,
  "active" BOOLEAN NOT NULL,
  "transport" BOOLEAN NOT NULL,
  "sent_requests" smallint NOT NULL,
  "accepted_requests" smallint NOT NULL,
  "completed_requests" smallint NOT NULL,
  CONSTRAINT "FK_worker_user"
    FOREIGN KEY("id")
      REFERENCES "user"("id")
  -- the worker will be added to user table after that he will be added to worker table with same id
);

CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(80) NOT NULL UNIQUE, -- the query of search category by its name is frequently
  "description" TEXT,
  "logo" VARCHAR(100),
  "start_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "workers" INT NOT NULL,
  "sent_requests" INT NOT NULL,
  "accepted_requests" INT NOT NULL,
  "completed_requests" INT NOT NULL,
  "parent_category" INT,  -- can be null
  CONSTRAINT "FK_category_category"
    FOREIGN KEY("parent_category")
      REFERENCES "category"("id")
);

CREATE TABLE "unity" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL
);

CREATE TABLE "worker_category" (
  "id" SERIAL PRIMARY KEY,
  "category_id" INT NOT NULL,
  "worker_id" UUID NOT NULL,
  "price" NUMERIC(8,2),
  "unity_id" smallint NOT NULL,
  CONSTRAINT "FK_worker-category_worker"
    FOREIGN KEY ("worker_id")
      REFERENCES "worker"("id"),
  CONSTRAINT "FK_worker-category_category"
    FOREIGN KEY ("category_id")
      REFERENCES "category"("id"),
  CONSTRAINT "FK_worker-category_unity"
    FOREIGN KEY ("unity_id")
      REFERENCES "unity"("id"),
  CONSTRAINT "unique_category_worker_unity"
    UNIQUE("category_id","worker_id","unity_id")
  -- query of search the workers of each category is frequent then search categories of each worker
);

CREATE TABLE "payment_methode" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL,
  "description" TEXT
);

CREATE TABLE "worker_payment" (
  "id" SERIAL PRIMARY KEY,
  "payment_id" smallint NOT NULL,
  "worker_id" UUID NOT NULL,
  CONSTRAINT "FK_worker-payement_worker"
    FOREIGN KEY ("worker_id")
      REFERENCES "worker"("id"),
  CONSTRAINT "FK_worker-payement_payment-methode"
    FOREIGN KEY ("payment_id")
      REFERENCES "payment_methode"("id"),
  CONSTRAINT "unique_woker_payment-methode"
    UNIQUE("worker_id","payment_id")
  -- query of get all the payment methods of worker is frequent
);

CREATE TABLE "day" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(9) NOT NULL
);

CREATE TABLE "time_work" (
  "worker_id" UUID NOT NULL,
  "day" smallint NOT NULL,
  "begin" TIME,
  "end" TIME,
  PRIMARY KEY("worker_id","day"),
  CONSTRAINT "FK_time-work_worker"
    FOREIGN KEY ("worker_id")
      REFERENCES "worker"("id"),
  CONSTRAINT "FK_time-work_day"
    FOREIGN KEY ("day")
      REFERENCES "day"("id")
);

CREATE TABLE "request_type" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);

CREATE TABLE "request_status" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);