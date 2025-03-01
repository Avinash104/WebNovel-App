# Micellaneous setups for Supabase database

**This is a guide for database triggers and scheduled jobs**

## Table of Contents

- [Cron Job Scheduler for views](#cron-scheduler)
- [Trigger for author](#trigger-story-author)
- [Real Time Supabase Messages](#real-time-message-update)

## Cron Job Scheduler for views

Below is the steps to set up a cron job schedule to collect all views on the chapters of a story.

1. Enable the pg_cron extension (must be done in the primary database)

```sql
create extension if not exists pg_cron;
```

2. Grant access of cron to the postgres database/tables

```sql
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
```

3. Schedule job to update the story views every 10 mins by aggregating the total views from chapters

```sql
SELECT cron.schedule(
  'update_story_views',  -- Job name
  '*/10 * * * *',         -- Runs every 10 minutes
  $$UPDATE "Story"
    SET "views" = COALESCE((
        SELECT SUM("views")
        FROM "Chapter"
        WHERE "Chapter"."storyId" = "Story".id
        AND "Chapter"."published" = TRUE
    ), 0)$$
);
```

## Trigger for author

Below are the steps to set up Supabase Trigger creation to undate the author field of the story every time a new story is added.

1. Function to update the author field once insert is triggered on story table

```sql
CREATE OR REPLACE FUNCTION update_story_author()
RETURNS TRIGGER AS $$
BEGIN
-- Update the author name in the Story table
UPDATE "Story"
SET author = (
SELECT username
FROM "Profile"
WHERE id = NEW."userId"
 )
WHERE id = NEW.id;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

2. Create a trigger to execute the story update function

```sql
CREATE TRIGGER trigger_update_story_author
AFTER INSERT ON "Story"
FOR EACH ROW
EXECUTE FUNCTION update_story_author();
```

## Real Time Supabase Messages

```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime_messages_publication';
ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE "Message";
GRANT SELECT ON "Message" TO anon;
```

```sql
-- ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE "ConversationUnreadCount";
GRANT SELECT ON "ConversationUnreadCount" TO anon;
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime_messages_publication';
```

```sql
SELECT cron.schedule(
  'update_unreadMessages_count',
  '*/10 * * * *',
  $$
  UPDATE "Conversation" c
  SET "unreadMessages" = COALESCE(subquery.unread_count, 0)
  FROM (
    SELECT "id" AS conversation_id,
      (SELECT COUNT(*)
       FROM "Message" m
       WHERE m."conversationId" = c.id
         AND m."isRead" = FALSE) AS unread_count
    FROM "Conversation" c
  ) AS subquery
  WHERE c.id = subquery.conversation_id;
  $$
);
```
