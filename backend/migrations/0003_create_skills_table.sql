CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    category TEXT NOT NULL,

    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),

    icon TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);