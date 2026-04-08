ALTER TABLE public.favorites
ADD COLUMN user_rating integer,
ADD COLUMN rated_at timestamp with time zone;

-- Add a check constraint to ensure rating is 1-5
ALTER TABLE public.favorites
ADD CONSTRAINT favorites_user_rating_range CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5));