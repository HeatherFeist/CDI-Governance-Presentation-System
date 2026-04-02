import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Copy, Check, FileText, Sheet, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import {
  WORKSPACE_TEMPLATES,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type WorkspaceTemplate,
} from "../lib/templates";

const CATEGORY_ICONS: Record<WorkspaceTemplate["category"], typeof FileText> = {
  doc: FileText,
  sheet: Sheet,
  form: ClipboardList,
};

interface Props {
  org: any;
}

export default function TemplatesPanel({ org: _org }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | WorkspaceTemplate["category"]>("all");

  const copyContent = async (template: WorkspaceTemplate) => {
    try {
      await navigator.clipboard.writeText(template.starterContent);
      setCopiedId(template.id);
      toast.success(`"${template.name}" copied — paste it into your new ${CATEGORY_LABEL[template.category]}`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast.error("Clipboard not available. See browser settings.");
    }
  };

  const filtered = filter === "all"
    ? WORKSPACE_TEMPLATES
    : WORKSPACE_TEMPLATES.filter((t) => t.category === filter);

  const counts = {
    all: WORKSPACE_TEMPLATES.length,
    doc: WORKSPACE_TEMPLATES.filter((t) => t.category === "doc").length,
    sheet: WORKSPACE_TEMPLATES.filter((t) => t.category === "sheet").length,
    form: WORKSPACE_TEMPLATES.filter((t) => t.category === "form").length,
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Google Workspace Templates</h2>
        <p className="text-neutral-300 text-sm">
          Free tools built on Google Docs, Sheets, and Forms — already available in your nonprofit Workspace account.
          Click <strong>Create in Google</strong> to open a new file, then click <strong>Copy Starter Content</strong>
          to paste in a ready-made outline.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-5">
        <p className="text-sm font-semibold text-blue-300 mb-2">How to use these templates</p>
        <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
          <li>Click <strong>Create in Google</strong> — a new file opens in your Google Drive</li>
          <li>Click <strong>Copy Starter Content</strong> — the outline is copied to your clipboard</li>
          <li>Paste it (<kbd className="bg-blue-900/60 px-1 rounded text-xs">Ctrl+V</kbd>) into your new file and customize</li>
          <li>Share the file with your board or save the link in your Google Drive</li>
        </ol>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "doc", "sheet", "form"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === cat
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {cat === "all" ? `All (${counts.all})` : `${CATEGORY_LABEL[cat]} (${counts[cat]})`}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((template, i) => {
          const CategoryIcon = CATEGORY_ICONS[template.category];
          const isCopied = copiedId === template.id;

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all space-y-4"
            >
              {/* Card header */}
              <div className="flex items-start gap-3">
                <div className="text-3xl leading-none mt-0.5">{template.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLOR[template.category]}`}>
                      <CategoryIcon className="w-3 h-3 inline mr-1 -mt-px" />
                      {CATEGORY_LABEL[template.category]}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{template.description}</p>
                </div>
              </div>

              {/* Starter content preview */}
              <pre className="text-xs text-neutral-500 bg-white/4 rounded-xl p-3 overflow-hidden max-h-24 whitespace-pre-wrap font-mono leading-relaxed">
                {template.starterContent.slice(0, 280)}{template.starterContent.length > 280 ? "…" : ""}
              </pre>

              {/* Action buttons */}
              <div className="flex gap-2">
                <a
                  href={template.createUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-black text-xs font-medium hover:bg-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Create in Google
                </a>
                <button
                  onClick={() => copyContent(template)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isCopied
                      ? "bg-green-500/15 border-green-400/40 text-green-300"
                      : "bg-white/5 border-white/15 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? "Copied!" : "Copy Starter Content"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer tip */}
      <p className="text-xs text-neutral-400 text-center pb-4">
        All templates use free Google Workspace tools. You own and control every file created in your Drive.
      </p>
    </div>
  );
}
