-- Add note_id column to public.materials table
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS note_id uuid REFERENCES public.notes(id) ON DELETE SET NULL;

-- Create index on note_id for better query performance
CREATE INDEX IF NOT EXISTS idx_materials_note_id ON public.materials(note_id);

-- Update RLS policies for materials table to include WITH CHECK clause
-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Tutors can insert their own materials" ON public.materials;
DROP POLICY IF EXISTS "Tutors can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Tutors can select their own materials" ON public.materials;
DROP POLICY IF EXISTS "Tutors can delete their own materials" ON public.materials;
DROP POLICY IF EXISTS "Students can select their own materials" ON public.materials;

-- Recreate policies with WITH CHECK clause for tutors
CREATE POLICY "Tutors can insert their own materials"
    ON public.materials
    FOR INSERT
    WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own materials"
    ON public.materials
    FOR UPDATE
    USING (auth.uid() = tutor_id)
    WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can select their own materials"
    ON public.materials
    FOR SELECT
    USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete their own materials"
    ON public.materials
    FOR DELETE
    USING (auth.uid() = tutor_id);

-- Students can select materials assigned to them
CREATE POLICY "Students can select their own materials"
    ON public.materials
    FOR SELECT
    USING (student_id = auth.uid());

