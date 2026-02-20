-- Add diet_preference column to health_data table
ALTER TABLE public.health_data 
ADD COLUMN diet_preference TEXT NOT NULL DEFAULT 'non_vegetarian' 
CHECK (diet_preference IN ('vegan', 'vegetarian', 'non_vegetarian'));