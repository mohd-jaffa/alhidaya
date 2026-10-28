-- The local databases and users (plan §26.1, §35.1), made once when the
-- container's volume is new. Production has the same two users: the app with
-- data rights only, and the migrator with schema rights, used only for
-- migrations. Passwords here are for this machine only.

CREATE DATABASE IF NOT EXISTS alhidaya CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS alhidaya_test CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'alhidaya_app'@'%' IDENTIFIED BY 'local-app';
CREATE USER IF NOT EXISTS 'alhidaya_migrator'@'%' IDENTIFIED BY 'local-migrator';

GRANT SELECT, INSERT, UPDATE, DELETE ON alhidaya.* TO 'alhidaya_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON alhidaya_test.* TO 'alhidaya_app'@'%';
GRANT ALL PRIVILEGES ON alhidaya.* TO 'alhidaya_migrator'@'%';
GRANT ALL PRIVILEGES ON alhidaya_test.* TO 'alhidaya_migrator'@'%';

FLUSH PRIVILEGES;
