import { getAdapter } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata = { title: "Calendar" };

// Data is read live from the Obsidian vault on each request.
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const events = await getAdapter().getCalendarData();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="System"
        title="Calendar"
        description="Every dated record across the vault — assignments, exams, research, scholarships and milestones."
      />
      <CalendarView events={events} />
    </div>
  );
}
