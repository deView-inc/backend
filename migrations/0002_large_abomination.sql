CREATE TABLE "base"."sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"user_agent" text NOT NULL,
	"ip" varchar(45) NOT NULL,
	"country" varchar(100),
	"city" varchar(100),
	"country_code" varchar(5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);

ALTER TABLE "base"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users"("id") ON DELETE cascade ON UPDATE no action;