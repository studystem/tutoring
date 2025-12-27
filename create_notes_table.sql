-- Create public.notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS notes_tutor_id_idx ON public.notes(tutor_id);
CREATE INDEX IF NOT EXISTS notes_student_id_idx ON public.notes(student_id);
CREATE INDEX IF NOT EXISTS notes_event_id_idx ON public.notes(event_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON public.notes(created_at DESC);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: Tutors can insert/select/update/delete their own notes
CREATE POLICY "Tutors can insert their own notes"
    ON public.notes
    FOR INSERT
    WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Tutors can select their own notes"
    ON public.notes
    FOR SELECT
    USING (tutor_id = auth.uid());

CREATE POLICY "Tutors can update their own notes"
    ON public.notes
    FOR UPDATE
    USING (tutor_id = auth.uid())
    WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Tutors can delete their own notes"
    ON public.notes
    FOR DELETE
    USING (tutor_id = auth.uid());

-- Policy: Students can select notes assigned to them
CREATE POLICY "Students can select their own notes"
    ON public.notes
    FOR SELECT
    USING (student_id = auth.uid());

