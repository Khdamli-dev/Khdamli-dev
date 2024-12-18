CREATE TABLE "language" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(2) NOT NULL
);

-- we make this table to destinct between tables that need translation
CREATE TABLE "entity" (
  "id" smallserial PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
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
      REFERENCES "region"("id")
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