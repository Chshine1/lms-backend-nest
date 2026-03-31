import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774937230326 implements MigrationInterface {
    name = 'Init1774937230326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_permissions" ("userId" integer NOT NULL, "resource" smallint NOT NULL, "action" smallint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_344271f7c48c9a1c02e73a69484" PRIMARY KEY ("userId", "resource", "action"))`);
        await queryRunner.query(`CREATE TABLE "assignments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "course_unit_id" integer NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "due_date" TIMESTAMP NOT NULL, "attachments" integer array NOT NULL DEFAULT '{}', CONSTRAINT "PK_c54ca359535e0012b04dcbd80ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_materials" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "course_unit_id" integer NOT NULL, "file_id" integer NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "uploader_id" integer NOT NULL, CONSTRAINT "PK_b8d788301b7ea04c1cefc4bd2ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_units" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "course_id" integer NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "position" double precision NOT NULL, CONSTRAINT "PK_2e87ce20535110712778a829937" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "tenant_id" integer NOT NULL, "teachers" integer array NOT NULL DEFAULT '{}', "created_by" integer NOT NULL, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "storage_key" character varying(512) NOT NULL, "content_type" character varying(100) NOT NULL, "size" bigint NOT NULL, "checksum" character varying(64) NOT NULL, "created_by" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "UQ_files_storage_key" UNIQUE ("storage_key"), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_files_created_by" ON "files" ("created_by") `);
        await queryRunner.query(`CREATE INDEX "IDX_files_content_type" ON "files" ("content_type") `);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" SERIAL NOT NULL, "student_id" integer NOT NULL, "course_id" integer NOT NULL, "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_850389020f5faddd405e279263" ON "enrollments" ("student_id", "course_id") `);
        await queryRunner.query(`CREATE TABLE "course_schedules" ("id" SERIAL NOT NULL, "course_id" integer NOT NULL, "dayOfWeek" character varying(20) NOT NULL, "start_time" character varying(5) NOT NULL, "end_time" character varying(5) NOT NULL, "location" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_68118fc569f0c9ebb03fb79f80e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "submissions" ("id" SERIAL NOT NULL, "enrollment_id" integer NOT NULL, "assignment_id" integer NOT NULL, "submissionText" text, "attachments" jsonb, "submitted_at" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_submission_status" ON "submissions" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_submission_enrollment_assignment" ON "submissions" ("enrollment_id", "assignment_id") `);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "submission_id" integer NOT NULL, "teacher_id" integer NOT NULL, "score" smallint NOT NULL, "feedback" text NOT NULL, "reviewed_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_review_submission" ON "reviews" ("submission_id") `);
        await queryRunner.query(`CREATE TABLE "students" ("user_id" integer NOT NULL, "student_id" character varying NOT NULL, CONSTRAINT "PK_fb3eff90b11bddf7285f9b4e281" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "teachers" ("user_id" integer NOT NULL, "employee_id" character varying NOT NULL, "qualifications" text NOT NULL, "hire_date" date NOT NULL, CONSTRAINT "PK_4668d4752e6766682d1be0b346f" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "tenant_id" integer NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password_hash" character varying NOT NULL, "status" smallint NOT NULL DEFAULT '2', "identity_type" smallint NOT NULL, CONSTRAINT "UQ_user_tenant_email" UNIQUE ("tenant_id", "email"), CONSTRAINT "UQ_user_tenant_username" UNIQUE ("tenant_id", "username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campuses" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "tenant_id" integer NOT NULL, "name" character varying NOT NULL, "location" text NOT NULL, CONSTRAINT "PK_d6a06870edd505bfc2d002cb728" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "UQ_3021c18db2b363ae9324c826c5a" UNIQUE ("code"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "campuses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "teachers"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_review_submission"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_submission_enrollment_assignment"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_submission_status"`);
        await queryRunner.query(`DROP TABLE "submissions"`);
        await queryRunner.query(`DROP TABLE "course_schedules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_850389020f5faddd405e279263"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_files_content_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_files_created_by"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "course_units"`);
        await queryRunner.query(`DROP TABLE "course_materials"`);
        await queryRunner.query(`DROP TABLE "assignments"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
    }

}
