"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Heading1, Heading2, Heading3, List, Text } from "lucide-react";
import clsx from "clsx";
import { PageBlock } from "@/lib/types";

type PageEditorProps = {
  page: {
    id: string;
    title: string | null;
    icon: string | null;
    parentId: string | null;
  };
  initialBlocks: PageBlock[];
};

const BLOCK_OPTIONS: {
  type: PageBlock["type"];
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] =
  [
    { type: "paragraph", label: "Paragraph", icon: Text },
    { type: "heading_1", label: "Heading 1", icon: Heading1 },
    { type: "heading_2", label: "Heading 2", icon: Heading2 },
    { type: "heading_3", label: "Heading 3", icon: Heading3 },
    { type: "todo", label: "To-do", icon: CheckSquare },
    { type: "bulleted_list", label: "Bullet List", icon: List }
  ];

export function PageEditor({ page, initialBlocks }: PageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title ?? "Untitled");
  const [icon, setIcon] = useState(page.icon ?? "🪄");
  const [blocks, setBlocks] = useState<PageBlock[]>(
    initialBlocks.map((block, index) => ({
      ...block,
      position: block.position ?? index,
      content: {
        text: block.content?.text ?? "",
        checked: block.content?.checked ?? false
      }
    }))
  );
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSavingTitle, setSavingTitle] = useState(false);

  const titleSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const ensureBlocks = () => {
    if (blocks.length === 0) {
      const newBlock = createEmptyBlock();
      setBlocks([newBlock]);
      void persistBlock(newBlock);
    }
  };

  useEffect(() => {
    ensureBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveTitle = useCallback(
    async (value: string, iconValue = icon) => {
      setSavingTitle(true);
      try {
        await fetch(`/api/pages/${page.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title: value, icon: iconValue })
        });
        router.refresh();
      } catch (error) {
        console.error(error);
      } finally {
        setSavingTitle(false);
      }
    },
    [icon, page.id, router]
  );

  useEffect(() => {
    if (!title.trim()) return;
    if (titleSaveTimeout.current) {
      clearTimeout(titleSaveTimeout.current);
    }
    titleSaveTimeout.current = setTimeout(() => {
      void saveTitle(title);
    }, 600);
  }, [title, saveTitle]);

  const createEmptyBlock = (): PageBlock => ({
    id: crypto.randomUUID(),
    page_id: page.id,
    type: "paragraph",
    content: {
      text: ""
    },
    position: blocks.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const persistBlock = async (block: PageBlock) => {
    try {
      const res = await fetch(`/api/blocks/${block.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(block)
      });
      if (!res.ok) {
        throw new Error("Failed to save block");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addBlockBelow = (index: number) => {
    const newBlock = createEmptyBlock();
    let insertAt = index < 0 ? blocks.length : Math.min(index + 1, blocks.length);
    setBlocks((prev) => {
      const copy = [...prev];
      insertAt = index < 0 ? copy.length : Math.min(index + 1, copy.length);
      copy.splice(insertAt, 0, newBlock);
      return copy.map((block, idx) => ({ ...block, position: idx }));
    });
    void persistBlock({ ...newBlock, position: insertAt });
    setSelectedBlock(newBlock.id);
  };

  const updateBlockContent = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              content: {
                ...block.content,
                text
              }
            }
          : block
      )
    );
  };

  const toggleTodo = (id: string, checked: boolean) => {
    let target: PageBlock | undefined;
    setBlocks((prev) => {
      const next = prev.map((block) =>
        block.id === id
          ? {
              ...block,
              content: {
                ...block.content,
                checked
              }
            }
          : block
      );
      target = next.find((block) => block.id === id);
      return next;
    });
    if (target) {
      void persistBlock(target);
    }
  };

  const changeBlockType = (id: string, type: PageBlock["type"]) => {
    let target: PageBlock | undefined;
    setBlocks((prev) => {
      const next = prev.map((block) =>
        block.id === id
          ? {
              ...block,
              type
            }
          : block
      );
      target = next.find((block) => block.id === id);
      return next;
    });
    if (target) {
      void persistBlock(target);
    }
  };

  const removeBlock = (id: string) => {
    const updatedBlocks: PageBlock[] = [];
    setBlocks((prev) =>
      prev
        .filter((block) => block.id !== id)
        .map((block, index) => {
          const nextBlock = { ...block, position: index };
          updatedBlocks.push(nextBlock);
          return nextBlock;
        })
    );
    void fetch(`/api/blocks/${id}`, {
      method: "DELETE"
    });
    void Promise.all(updatedBlocks.map((block) => persistBlock(block)));
  };

  const handleBlur = (block: PageBlock) => {
    const latest = blocks.find((item) => item.id === block.id);
    if (latest) {
      void persistBlock(latest);
    }
  };

  const handleTitleBlur = () => {
    if (titleSaveTimeout.current) {
      clearTimeout(titleSaveTimeout.current);
      titleSaveTimeout.current = null;
    }
    void saveTitle(title);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-4">
        <button
          className="text-5xl"
          onClick={() => {
            const nextIcon = prompt("Choose an emoji for this page", icon);
            if (nextIcon) {
              setIcon(nextIcon);
              void saveTitle(title, nextIcon);
            }
          }}
        >
          {icon}
        </button>
        <div className="flex items-center gap-3">
          <input
            className="w-full bg-transparent text-4xl font-semibold text-white outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
          />
          {isSavingTitle && <span className="text-sm text-slate-500">Saving…</span>}
        </div>
      </div>
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={clsx(
              "group relative flex items-start gap-3 rounded-md px-2 py-1 transition",
              selectedBlock === block.id ? "bg-slate-900/60" : "hover:bg-slate-900/40"
            )}
            onClick={() => setSelectedBlock(block.id)}
          >
            <BlockTypeToolbar
              block={block}
              isVisible={selectedBlock === block.id}
              onChangeType={(type) => changeBlockType(block.id, type)}
              onRemove={() => removeBlock(block.id)}
            />
            <div className="flex-1">
              {block.type === "todo" ? (
                <label className="flex items-center gap-3 text-lg">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-slate-700 bg-slate-900 text-brand focus:ring-brand"
                    checked={Boolean(block.content.checked)}
                    onChange={(event) => toggleTodo(block.id, event.target.checked)}
                  />
                  <textarea
                    value={block.content.text}
                    className="min-h-10 w-full resize-none bg-transparent text-base outline-none"
                    placeholder="To-do"
                    onChange={(event) => updateBlockContent(block.id, event.target.value)}
                    onBlur={() => handleBlur(block)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        addBlockBelow(index);
                      }
                    }}
                  />
                </label>
              ) : (
                <textarea
                  value={block.content.text}
                  className={clsx(
                    "min-h-10 w-full resize-none bg-transparent outline-none",
                    block.type === "heading_1" && "text-3xl font-semibold",
                    block.type === "heading_2" && "text-2xl font-semibold",
                    block.type === "heading_3" && "text-xl font-semibold",
                    block.type === "bulleted_list" && "pl-4"
                  )}
                  placeholder="Start typing..."
                  onChange={(event) => updateBlockContent(block.id, event.target.value)}
                  onBlur={() => handleBlur(block)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      addBlockBelow(index);
                    } else if (event.key === "Backspace" && !block.content.text) {
                      event.preventDefault();
                      removeBlock(block.id);
                    }
                  }}
                />
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => addBlockBelow(blocks.length - 1)}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          + Add block
        </button>
      </div>
    </div>
  );
}

type BlockTypeToolbarProps = {
  block: PageBlock;
  isVisible: boolean;
  onChangeType: (type: PageBlock["type"]) => void;
  onRemove: () => void;
};

function BlockTypeToolbar({ block, isVisible, onChangeType, onRemove }: BlockTypeToolbarProps) {
  return (
    <div
      className={clsx(
        "absolute left-0 top-0 z-10 flex -translate-x-full gap-2 rounded-md border border-slate-800 bg-slate-950/90 p-1 shadow-lg transition-opacity",
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {BLOCK_OPTIONS.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          className={clsx(
            "rounded-md px-2 py-1 text-xs text-slate-300 transition",
            block.type === type ? "bg-brand/20 text-white" : "hover:bg-slate-900"
          )}
          onClick={() => onChangeType(type)}
        >
          <Icon className="mb-1 h-4 w-4" />
          {label}
        </button>
      ))}
      <button
        className="rounded-md px-2 py-1 text-xs text-rose-400 transition hover:bg-rose-500/10"
        onClick={onRemove}
      >
        Delete
      </button>
    </div>
  );
}
