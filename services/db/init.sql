-- Database-per-service: one logical database per owning service, created on
-- first Postgres init. (Cart is Redis-only, so no DB here.)
CREATE DATABASE auth;
CREATE DATABASE catalog;
CREATE DATABASE orders;
