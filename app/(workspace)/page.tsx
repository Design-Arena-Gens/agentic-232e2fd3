import Link from "next/link";
import { fetchPagesTree } from "@/lib/data/pages";

export default async function DashboardPage() {
  const pages = await fetchPagesTree();
  const firstPage = pages.at(0);

  if (firstPage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-400">
        <p>Redirecting to your first page...</p>
        <Link
          href={`/pages/${firstPage.id}`}
          className="text-brand underline-offset-4 hover:underline"
        >
          Continue to {firstPage.title || "Untitled"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-400">
      <h2 className="text-xl font-semibold text-white">Welcome!</h2>
      <p className="max-w-md">
        Create your first page from the sidebar to start capturing ideas, meeting notes,
        or documentation.
      </p>
    </div>
  );
}
