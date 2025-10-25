import { notFound } from "next/navigation";
import { fetchBlocks, fetchPage } from "@/lib/data/pages";
import { PageEditor } from "@/components/editor/page-editor";

type PageProps = {
  params: {
    pageId: string;
  };
};

export default async function PageView({ params }: PageProps) {
  const page = await fetchPage(params.pageId);
  if (!page) {
    notFound();
  }
  const blocks = await fetchBlocks(params.pageId);

  return (
    <PageEditor
      page={{
        id: page.id,
        title: page.title,
        icon: page.icon,
        parentId: page.parent_id
      }}
      initialBlocks={blocks}
    />
  );
}
