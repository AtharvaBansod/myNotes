# Supabase Notes Application Documentation

### I have tried to implement all given work (`POST` & `GET` endpoints) 
- Additionally, i have also implemented `PUT` and `DELETE` endpoints with proper working Authentication (for now no email verification, just Roles(Policies) for `CRUD` operations).
- All instructions for [`setup`](#4-setup--deployment-steps) too are listed along 

<hr/>

### Along with [`curl`](#3-curl-commands-with-sample-outputs) commands, test this live application :
### 🔗 **[My Notes App](https://my-notes-lovat-two.vercel.app/)**  

## **</>** [Github Repo](https://github.com/AtharvaBansod/myNotes)


### 1. Detailed `schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (title <> ''),
  description TEXT,
  image_url TEXT,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

------------Implementing Policies below------------------

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can manage their own profile" 
ON users FOR ALL USING (auth.uid() = id);

-- Notes table policies
CREATE POLICY "Enable read access for user's notes" 
ON notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users" 
ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for user's notes" 
ON notes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for user's notes" 
ON notes FOR DELETE USING (auth.uid() = user_id);
```

### Schema Design :
- **UUID primary keys**: Better than sequential IDs for security and distribution
- **CASCADE deletes**: Automatically clean up related notes when users are deleted
- **NOT NULL constraints**: Ensures required fields are always populated
- **DEFAULT timestamps**: Automatic tracking of record creation/modification
- **RLS policies**: Strict per-user data isolation for security
- **CHECK constraints**: Prevent empty titles while allowing null descriptions

## 2. Edge Functions Implementation



### `functions/notes/post_notes.ts`
```ts
// (POST /notes - Creates note with data from request body)
// POST for resource creation with payload in body
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```

### `functions/notes/get_notes.ts`
```ts
// GET /notes - Lists all notes for authenticated user
// GET for safe data retrieval with no body needed
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```

### `functions/notes/put.ts`
```ts
// PUT /notes/:id - Updates specific note with ID in path and data in body
// PUT for full resource updates with clearly specified resource
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```

### `functions/notes/delete.ts`
```ts
// DELETE /notes/:id - Deletes note with ID from path parameter
// DELETE for resource removal with ID in path
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```

### `functions/auth.ts`
```ts
// POST /auth - Handles both login and signup via email/password in request body
// Uses POST for security (credentials in body) and to modify server state
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```

### `functions/verify-session.ts`
```ts
// POST /verify-session - Validates JWT from Authorization header
// Uses POST to follow auth convention despite being idempotent
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // files are provided seperately in zip
});
```


## 3. cURL Commands with Sample Outputs

#### *Variables are not exposed, but [`Frontend`](https://my-notes-lovat-two.vercel.app/) application & [`Repository`](https://github.com/AtharvaBansod/myNotes)/attached Zip,  has the entire implementation.*



### Post Note
```bash
curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/notes' \
  -H 'Authorization: Bearer [ACCESS_TOKEN]' \
  -H 'Content-Type: application/json' \
  -d '{"title":"My First Note","description":"This is a test note","image_url":"https://example.com/image.jpg"}'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  "title": "My First Note",
  "description": "This is a test note",
  "image_url": "https://example.com/image.jpg",
  "is_bookmarked": false,
  "created_at": "2023-07-15T10:00:00Z"
}
```

### Get Notes
```bash
curl -X GET 'https://[PROJECT_REF].supabase.co/functions/v1/notes' \
  -H 'Authorization: Bearer [ACCESS_TOKEN]'
```

**Response:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
    "title": "My First Note",
    "description": "This is a test note",
    "image_url": "https://example.com/image.jpg",
    "is_bookmarked": false,
    "created_at": "2023-07-15T10:00:00Z",
    "updated_at": "2023-07-15T10:00:00Z"
  }
]
```

### Update Note
```bash
curl -X PUT 'https://[PROJECT_REF].supabase.co/functions/v1/notes/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' \
  -H 'Authorization: Bearer [ACCESS_TOKEN]' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Updated Note","is_bookmarked":true}'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  "title": "Updated Note",
  "is_bookmarked": true,
  "updated_at": "2023-07-15T10:05:00Z"
}
```

### Delete Note
```bash
curl -X DELETE 'https://[PROJECT_REF].supabase.co/functions/v1/notes/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' \
  -H 'Authorization: Bearer [ACCESS_TOKEN]'
```

**Response:**
```json
{"success":true,"message":"Note deleted"}
```

### User Registration
```bash
curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/auth' \
  -H 'Authorization: Bearer [ANON_KEY]' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"securepassword","name":"Test User"}'
```

**Response:**
```json
{
  "user": {
    "id": "d3d8a8f0-7c5a-4b3a-9a2f-5b9c6d1e2f3a",
    "email": "user@example.com",
    "user_metadata": {"name":"Test User"}
  },
  "session": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 3600
  }
}
```

## 4. Setup & Deployment Steps

### Prerequisites
1. Supabase account
2. Supabase CLI `npm install -g supabase`

### Setup Process

1. **Initialize Project**:
   ```bash
   supabase init
   ```

2. **Link to Supabase Project**:
   ```bash
   supabase login
   supabase link --project-ref [PROJECT_REF]
   ```

3. **Set Environment Variables**:
   Create `.env` file:
   ```env
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY=[ANON_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
   ```

4. **Deploy Database Schema**:
   ```bash
   supabase db push --schema public
   ```

5. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy notes/post_notes
   supabase functions deploy notes/get_notes
   supabase functions deploy notes/put
   supabase functions deploy notes/delete
   supabase functions deploy auth
   supabase functions deploy verify-session
   ```

