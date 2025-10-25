export type WorkspacePage = {
  id: string;
  title: string;
  parent_id: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  children?: WorkspacePage[];
};

export type PageBlock = {
  id: string;
  page_id: string;
  type: "paragraph" | "heading_1" | "heading_2" | "heading_3" | "todo" | "bulleted_list";
  content: {
    text: string;
    checked?: boolean;
  };
  position: number;
  created_at: string;
  updated_at: string;
};
