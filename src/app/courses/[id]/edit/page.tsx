import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditCourseForm } from "@/components/courses/edit-course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id,title,description,start_date,end_date,capacity,price,is_active")
    .eq("id", id)
    .maybeSingle();

  if (!course) notFound();
  return <EditCourseForm course={course} />;
}
