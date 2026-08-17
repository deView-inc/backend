CREATE TYPE "base"."user_gender" AS ENUM('male', 'female', 'non_binary', 'other', 'prefer_not_to_say');
CREATE TYPE "base"."user_grade" AS ENUM('trainee', 'junior', 'junior+', 'middle', 'middle+', 'senior');
CREATE TYPE "base"."user_pronouns" AS ENUM('he_him', 'she_her', 'they_them', 'other');
CREATE TYPE "base"."user_theme" AS ENUM('light', 'dark', 'system');
CREATE TABLE "base"."user_notifications" (
	"user_id" text PRIMARY KEY NOT NULL,
	"settings" jsonb DEFAULT '{"email":{"interview_reminder":true},"push":{"interview_reminder":true}}'::jsonb NOT NULL
);

CREATE TABLE "base"."user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"theme" "base"."user_theme" DEFAULT 'system' NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"language" varchar(5) DEFAULT 'ru' NOT NULL
);

CREATE TABLE "base"."user_security" (
	"user_id" text PRIMARY KEY NOT NULL,
	"recovery_email" varchar(255),
	"is_2fa_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_secret" text,
	"last_login_at" timestamp with time zone
);

CREATE TABLE "base"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50),
	"occupation" varchar(50),
	"location" varchar(255),
	"grade" "base"."user_grade" DEFAULT 'trainee' NOT NULL,
	"stack" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"email" varchar(255) NOT NULL,
	"bio" text,
	"gender" "base"."user_gender",
	"pronouns" "base"."user_pronouns",
	"pronouns_custom" varchar(50),
	"avatar_url" varchar(512),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

ALTER TABLE "base"."user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "base"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "base"."user_security" ADD CONSTRAINT "user_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users"("id") ON DELETE cascade ON UPDATE no action;