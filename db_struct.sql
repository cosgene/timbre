--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: log_profile_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_profile_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO profiles_audit_log ("ProfileId", "UserId", "Action", "NewData")
        VALUES (NEW."Id", NEW."UserId", 'INSERT', to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO profiles_audit_log ("ProfileId", "UserId", "Action", "OldData", "NewData")
        VALUES (NEW."Id", NEW."UserId", 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO profiles_audit_log ("ProfileId", "UserId", "Action", "OldData")
        VALUES (OLD."Id", OLD."UserId", 'DELETE', to_jsonb(OLD));
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_profile_changes() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Channels" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Type" text NOT NULL,
    "ServerId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "ProfileId" uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Channels" OWNER TO postgres;

--
-- Name: CodeSessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CodeSessions" (
    "Id" uuid NOT NULL,
    "ServerId" uuid NOT NULL,
    "ChannelId" uuid NOT NULL,
    "Text" text NOT NULL,
    "Language" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."CodeSessions" OWNER TO postgres;

--
-- Name: Members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Members" (
    "Id" uuid NOT NULL,
    "Role" text NOT NULL,
    "ProfileId" uuid NOT NULL,
    "ServerId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Members" OWNER TO postgres;

--
-- Name: Messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Messages" (
    "Id" uuid NOT NULL,
    "MemberId" uuid NOT NULL,
    "ChannelId" uuid NOT NULL,
    "FileUrl" text NOT NULL,
    "Content" text DEFAULT ''::text NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL,
    "Deleted" boolean DEFAULT false NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Messages" OWNER TO postgres;

--
-- Name: Profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Profiles" (
    "Id" uuid NOT NULL,
    "UserId" text NOT NULL,
    "Name" text NOT NULL,
    "ImageURL" text NOT NULL,
    "Email" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Profiles" OWNER TO postgres;

--
-- Name: Servers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Servers" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Name" text NOT NULL,
    "ImageUrl" text NOT NULL,
    "InviteCode" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT '-infinity'::timestamp with time zone NOT NULL
);


ALTER TABLE public."Servers" OWNER TO postgres;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- Name: profiles_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles_audit_log (
    "Id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "ProfileId" uuid NOT NULL,
    "UserId" text NOT NULL,
    "Action" text NOT NULL,
    "OldData" jsonb,
    "NewData" jsonb,
    "ChangedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profiles_audit_log OWNER TO postgres;

--
-- Name: Channels PK_Channels; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Channels"
    ADD CONSTRAINT "PK_Channels" PRIMARY KEY ("Id");


--
-- Name: CodeSessions PK_CodeSessions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CodeSessions"
    ADD CONSTRAINT "PK_CodeSessions" PRIMARY KEY ("Id");


--
-- Name: Members PK_Members; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Members"
    ADD CONSTRAINT "PK_Members" PRIMARY KEY ("Id");


--
-- Name: Messages PK_Messages; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "PK_Messages" PRIMARY KEY ("Id");


--
-- Name: Profiles PK_Profiles; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Profiles"
    ADD CONSTRAINT "PK_Profiles" PRIMARY KEY ("Id");


--
-- Name: Servers PK_Servers; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Servers"
    ADD CONSTRAINT "PK_Servers" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: profiles_audit_log profiles_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles_audit_log
    ADD CONSTRAINT profiles_audit_log_pkey PRIMARY KEY ("Id");


--
-- Name: IX_Channels_Id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_Channels_Id" ON public."Channels" USING btree ("Id");


--
-- Name: IX_Channels_ProfileId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Channels_ProfileId" ON public."Channels" USING btree ("ProfileId");


--
-- Name: IX_Channels_ServerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Channels_ServerId" ON public."Channels" USING btree ("ServerId");


--
-- Name: IX_Members_ProfileId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Members_ProfileId" ON public."Members" USING btree ("ProfileId");


--
-- Name: IX_Members_ServerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Members_ServerId" ON public."Members" USING btree ("ServerId");


--
-- Name: IX_Messages_ChannelId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Messages_ChannelId" ON public."Messages" USING btree ("ChannelId");


--
-- Name: IX_Messages_Id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_Messages_Id" ON public."Messages" USING btree ("Id");


--
-- Name: IX_Messages_MemberId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_Messages_MemberId" ON public."Messages" USING btree ("MemberId");


--
-- Name: IX_Servers_Id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_Servers_Id" ON public."Servers" USING btree ("Id");


--
-- Name: Profiles profiles_audit_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER profiles_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public."Profiles" FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();


--
-- Name: Channels FK_Channels_Profiles_ProfileId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Channels"
    ADD CONSTRAINT "FK_Channels_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES public."Profiles"("Id") ON DELETE CASCADE;


--
-- Name: Channels FK_Channels_Servers_ServerId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Channels"
    ADD CONSTRAINT "FK_Channels_Servers_ServerId" FOREIGN KEY ("ServerId") REFERENCES public."Servers"("Id") ON DELETE CASCADE;


--
-- Name: Members FK_Members_Profiles_ProfileId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Members"
    ADD CONSTRAINT "FK_Members_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES public."Profiles"("Id") ON DELETE CASCADE;


--
-- Name: Members FK_Members_Servers_ServerId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Members"
    ADD CONSTRAINT "FK_Members_Servers_ServerId" FOREIGN KEY ("ServerId") REFERENCES public."Servers"("Id") ON DELETE CASCADE;


--
-- Name: Messages FK_Messages_Channels_ChannelId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Channels_ChannelId" FOREIGN KEY ("ChannelId") REFERENCES public."Channels"("Id") ON DELETE CASCADE;


--
-- Name: Messages FK_Messages_Members_MemberId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Members_MemberId" FOREIGN KEY ("MemberId") REFERENCES public."Members"("Id") ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

