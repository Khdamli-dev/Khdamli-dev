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
  "language" SMALLINT,
  "column_name" VARCHAR(30),  -- define the column of table, because there are some tables have at least two columns need to be translated
  "text" TEXT NOT NULL,
  PRIMARY KEY("entity_id","entity_key","column_name","language"),  -- the order is important
  CONSTRAINT "FK_translation_language"
    FOREIGN KEY ("language")
      REFERENCES "language"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_translation_entity"
    FOREIGN KEY ("entity_id")
      REFERENCES "entity"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "country"(
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(15) NOT NULL
);

CREATE TABLE "region"(
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL,
  "country" SMALLINT NOT NULL,
  CONSTRAINT "FK_region_country"
    FOREIGN KEY ("country")
      REFERENCES "country"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "city" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL,
  "region" INT NOT NULL,
  CONSTRAINT "FK_city_region"
    FOREIGN KEY ("region")
      REFERENCES "region"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "unique_regionID_cityName" -- optimize query of list all cities situated in the same region
  UNIQUE ("region","name")
);

CREATE TABLE "address" (
  "id" SERIAL PRIMARY KEY,
  "region" smallint NOT NULL, -- we let region_id because city_id can be null, so we can determine region & country
  "city" smallint,
  "street" VARCHAR(100),
  "address_number" smallint,
  CONSTRAINT "FK_address_city"
    FOREIGN KEY ("city")
      REFERENCES "city"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_address_region"
    FOREIGN KEY ("region")
      REFERENCES "region"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "role" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL
);

CREATE TABLE "permission" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL
);

CREATE TABLE "role_permission" (
  "role" smallint NOT NULL,
  "permission" smallint NOT NULL,
  PRIMARY KEY("permission","role"), -- frequent query is to get all roles of one permission
  CONSTRAINT "FK_role-permission_permission"
    FOREIGN KEY("permission")
      REFERENCES "permission"("id")
      ON DELETE CASCADE 
      ON UPDATE CASCADE,
  CONSTRAINT "FK_role-permission_role"
    FOREIGN KEY("role")
      REFERENCES "role"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TYPE sex_enum AS ENUM('male','female');

CREATE TABLE "sex" (
  "id" smallserial PRIMARY KEY,
  "name" sex_enum NOT NULL
);

CREATE TABLE "phone_ext" (
  "extension" smallint PRIMARY KEY,
  "country" smallint NOT NULL,
  CONSTRAINT "FK_phone-ext_country"
    FOREIGN KEY("country")
      REFERENCES "country"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "phone_number" INTEGER UNIQUE NOT NULL,
  "email" VARCHAR(254) UNIQUE NOT NULL,
  -- the query that check if phone number or email are already used is frequently
  "password" VARCHAR(60) NOT NULL,   -- 60 character to generate password with bcrypt library
  "username" VARCHAR(40) NOT NULL,
  "sex" SMALLINT,
  "age" SMALLINT,
  "address" INT,
  "role" SMALLINT NOT NULL,
  "registration_date" DATE,
  "profile_image" TEXT,
  CONSTRAINT "unique_username"
  UNIQUE ("username"), -- query of check if username is already used is frequently
  CONSTRAINT "FK_user_address"
    FOREIGN KEY ("address")
      REFERENCES "address"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_user_role"
    FOREIGN KEY ("role")
      REFERENCES "role"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_user_sex"
    FOREIGN KEY ("sex")
      REFERENCES "sex"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE EXTENSION IF NOT EXISTS pg_trgm; -- it is used fuzzy searches
CREATE INDEX username_trgm ON "user" USING GIN (username gin_trgm_ops);

CREATE TABLE "otp_codes" (
    "user_id" INT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    "otp" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "purpose" VARCHAR(20) NOT NULL CHECK (purpose IN ('account_verification', 'password_reset'))
);


CREATE TABLE "worker" (
  "id" INTEGER PRIMARY KEY,
  "registration_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "bio" TEXT,
  "active" BOOLEAN NOT NULL,
  "transport" BOOLEAN NOT NULL,
  "sent_requests" smallint NOT NULL,
  "accepted_requests" smallint NOT NULL,
  "completed_requests" smallint NOT NULL,
  "nbr_media" smallint NOT NULL,
  CONSTRAINT "FK_worker_user"
    FOREIGN KEY("id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
  -- the worker will be added to user table after that he will be added to worker table with same id
);

CREATE TABLE "category" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(80) NOT NULL UNIQUE, -- the query of search category by its name is frequently
  "description" TEXT,
  "logo" TEXT,
  "start_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "workers" INT NOT NULL,
  "sent_requests" INT NOT NULL,
  "accepted_requests" INT NOT NULL,
  "completed_requests" INT NOT NULL,
  "parent_category" INT,  -- can be null
  CONSTRAINT "FK_category_category"
    FOREIGN KEY("parent_category")
      REFERENCES "category"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

CREATE TABLE "unity" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL
);

CREATE TABLE "worker_category" (
  "id" SERIAL PRIMARY KEY,
  "category" INT NOT NULL,
  "worker" INTEGER NOT NULL,
  "price" NUMERIC(8,2),
  "unity" smallint NOT NULL,
  CONSTRAINT "FK_worker-category_worker"
    FOREIGN KEY ("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE 
      ON UPDATE CASCADE,
  CONSTRAINT "FK_worker-category_category"
    FOREIGN KEY ("category")
      REFERENCES "category"("id")
      ON DELETE CASCADE 
      ON UPDATE CASCADE,
  CONSTRAINT "FK_worker-category_unity"
    FOREIGN KEY ("unity")
      REFERENCES "unity"("id")
      ON DELETE CASCADE 
      ON UPDATE CASCADE,
  CONSTRAINT "unique_category_worker_unity"
    UNIQUE("category","worker","unity")
  -- query of search the workers of each category is frequent then search categories of each worker
);

CREATE TABLE "payment_method" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL
);

CREATE TABLE "worker_payment" (
  "id" SERIAL PRIMARY KEY,
  "payment" smallint NOT NULL,
  "worker" INTEGER NOT NULL,
  CONSTRAINT "FK_worker-payement_worker"
    FOREIGN KEY ("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_worker-payement_payment-method"
    FOREIGN KEY ("payment")
      REFERENCES "payment_method"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "unique_woker_payment-method"
    UNIQUE("worker","payment")
  -- query of get all the payment methods of worker is frequent
);

CREATE TYPE day_enum AS ENUM('sunday','monday','tuesday','wednesday','thursday','friday','saturday');

CREATE TABLE "day" (
  "id" smallserial PRIMARY KEY,
  "name" day_enum NOT NULL
);

CREATE TABLE "time_work" (
  "worker" INTEGER NOT NULL,
  "day" smallint NOT NULL,
  "begin" TIME,
  "end" TIME,
  PRIMARY KEY("worker","day"),
  CONSTRAINT "FK_time-work_worker"
    FOREIGN KEY ("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_time-work_day"
    FOREIGN KEY ("day")
      REFERENCES "day"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "request_type" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);

CREATE TABLE "request_status" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);

CREATE TABLE "request" (
  "id" SERIAL PRIMARY KEY,
  "worker" INTEGER, -- worker can be null (before choose worker in puplic request)
  "client" INTEGER NOT NULL,
  "client_address" INT NOT NULL,
  "sent_time" TIMESTAMP NOT NULL DEFAULT DATE_TRUNC('minute', CURRENT_TIMESTAMP),
  "working_time" TIMESTAMP NOT NULL,
  "category" INT NOT NULL,
  "payment" SMALLINT NOT NULL,
  "description" TEXT,
  "type" SMALLINT NOT NULL,
  "status" SMALLINT NOT NULL,
  CONSTRAINT "FK_request_worker"
    FOREIGN KEY("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request_user"
    FOREIGN KEY("client")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request_address"
    FOREIGN KEY("client_address")
      REFERENCES "address"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request_category"
    FOREIGN KEY("category")
      REFERENCES "category"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request-payment_method"
    FOREIGN KEY("payment")
      REFERENCES "payment_method"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request-request_type"
    FOREIGN KEY("type")
      REFERENCES "request_type"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request-request_status"
    FOREIGN KEY("status")
      REFERENCES "request_status"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "media_type" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);

CREATE TABLE "request_media" (
  "request" INTEGER NOT NULL,
  "media_type" smallint NOT NULL,
  "url" TEXT NOT NULL,
  PRIMARY KEY("request","media_type","url"),
  CONSTRAINT "FK_request-medias_media_type"
    FOREIGN KEY ("media_type")
      REFERENCES "media_type"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
  CONSTRAINT "FK_request-medias_request"
    FOREIGN KEY ("request")
      REFERENCES "request"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

CREATE TABLE "worker_media" (
  "worker" INTEGER NOT NULL,
  "media_type" smallint NOT NULL,
  "url" TEXT NOT NULL,
  PRIMARY KEY("worker","media_type","url"),
  CONSTRAINT "FK_worker_media.worker"
    FOREIGN KEY ("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_worker_media.media_type"
    FOREIGN KEY ("media_type")
      REFERENCES "media_type"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE TABLE "public_request_messages" (
  "request" INTEGER NOT NULL,
  "worker" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  PRIMARY KEY("request","worker"),
  CONSTRAINT "FK_public-request-messages_request"
    FOREIGN KEY ("request")
      REFERENCES "request"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE,
  CONSTRAINT "FK_public-request-messages_worker"
    FOREIGN KEY("worker")
      REFERENCES "worker"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

CREATE TABLE "updated_email" (
  "user_id" INT NOT NULL PRIMARY KEY,
  "email" VARCHAR(254) NOT NULL,
  CONSTRAINT "unique_updated_email"
  UNIQUE ("email"),
  CONSTRAINT "FK_updated-email_user"
    FOREIGN KEY("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
);