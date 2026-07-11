"use client";

import { useEffect, useState } from "react";
import { contentService, LearningResourceResponse } from "@/features/content/contentService";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { Library, ExternalLink, Search, BookOpen, Video, FileText, Globe } from "lucide-react";

const CATEGORIES = ["Tất cả", "GRAMMAR", "VOCABULARY", "SPEAKING", "LISTENING", "READING", "WRITING", "IELTS", "TOEIC"];

const MOCK_RESOURCES: LearningResourceResponse[] = [
  { id: 1, title: "BBC Learning English - 6 Minute English", type: "PODCAST", url: "https://www.bbc.co.uk/learningenglish", category: "LISTENING", createdAt: new Date().toISOString() },
  { id: 2, title: "Cambridge Dictionary Online", type: "WEBSITE", url: "https://dictionary.cambridge.org", category: "VOCABULARY", createdAt: new Date().toISOString() },
  { id: 3, title: "IELTS Liz - Official IELTS Tips", type: "WEBSITE", url: "https://ieltsliz.com", category: "IELTS", createdAt: new Date().toISOString() },
  { id: 4, title: "Grammarly Blog - English Grammar", type: "WEBSITE", url: "https://www.grammarly.com/blog", category: "GRAMMAR", createdAt: new Date().toISOString() },
  { id: 5, title: "TED Talks - English Listening Practice", type: "VIDEO", url: "https://www.ted.com", category: "LISTENING", createdAt: new Date().toISOString() },
  { id: 6, title: "Merriam-Webster Word of the Day", type: "WEBSITE", url: "https://www.merriam-webster.com", category: "VOCABULARY", createdAt: new Date().toISOString() },
];

const getTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO": return Video;
    case "PODCAST": return BookOpen;
    case "PDF": return FileText;
    default: return Globe;
  }
};

const getTypeColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case "VIDEO": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "PODCAST": return "text-green-400 bg-green-500/10 border-green-500/20";
    case "PDF": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  }
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResourceResponse[]>(MOCK_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");

  useEffect(() => {
    contentService.getResources({ page: 0, size: 20 })
      .then((data) => { if (data.content.length > 0) setResources(data.content); })
      .catch(() => {});
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch = search === "" || r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tất cả" || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Library className="w-6 h-6 text-green-400" />
          Tài nguyên học tập
        </h1>
        <p className="text-muted-foreground text-sm">
          Bộ sưu tập tài nguyên chất lượng cao được tuyển chọn bởi đội ngũ ECC
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm tài nguyên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ecc-input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? "bg-violet-500 text-white"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Đang tải tài nguyên..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Không tìm thấy tài nguyên"
          description="Thử tìm kiếm với từ khóa khác"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((resource, idx) => {
            const TypeIcon = getTypeIcon(resource.type);
            const typeStyle = getTypeColor(resource.type);
            return (
              <div key={resource.id} className={`animate-fade-in delay-${Math.min(idx * 100, 400)}`}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block glass-card rounded-xl p-5 hover:border-white/15 hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeStyle}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-violet-300 transition-colors line-clamp-2 leading-snug">
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex gap-1.5">
                      <span className={`badge-pill border text-[10px] ${typeStyle}`}>
                        {resource.type}
                      </span>
                      <span className="badge-pill border text-[10px] text-muted-foreground border-white/10">
                        {resource.category}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
