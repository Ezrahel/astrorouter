import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  emailTemplates,
  getTemplatePreview,
  getTemplateSubject,
  type EmailTemplateKey,
} from "@/email/templates";
import { Mail } from "lucide-react";

function EmailTemplatesPage() {
  const templateKeys = Object.keys(emailTemplates) as EmailTemplateKey[];
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateKey>(
    templateKeys[0],
  );

  const currentTemplate = emailTemplates[selectedTemplate];
  const previewHtml = getTemplatePreview(selectedTemplate);
  const previewSubject = getTemplateSubject(selectedTemplate);

  return (
    <div className="min-h-screen bg-[#070707] text-gray-300 font-sans selection:bg-accent/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#070707] border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AstroRouter Logo" className="w-8" />
              <span className="font-bold text-white text-lg tracking-tight">
                AstroRouter
              </span>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Email Templates
            </h2>
            <ul className="space-y-1">
              {templateKeys.map((key) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedTemplate(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      selectedTemplate === key
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Mail size={14} />
                    {emailTemplates[key].name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#101010] border border-white/5 m-2 rounded-2xl">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentTemplate.name}
                </h1>
                <p className="text-gray-500 mt-1">Subject: {previewSubject}</p>
              </div>

              {/* Parameters */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-3">
                  Template Parameters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentTemplate.params.map((param) => (
                    <code
                      key={String(param)}
                      className="px-2 py-1 bg-white/10 text-gray-300 rounded text-xs font-mono"
                    >
                      {String(param)}
                    </code>
                  ))}
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Email Preview</span>
                  <span className="text-xs text-gray-500">
                    Using preview parameters
                  </span>
                </div>
                <div className="bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    title={currentTemplate.name}
                    className="w-full h-150 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/email-templates")({
  component: EmailTemplatesPage,
});
