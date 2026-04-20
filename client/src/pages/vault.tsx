import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";
import { FolderLock, Upload, FileText, Trash2, Shield, Lock, CheckCircle2, Eye, Download, FileCheck, FileBadge, FileKey } from "lucide-react";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { fr, de, enGB, it } from "date-fns/locale";

function formatSize(bytes: number | null) {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const docTypeIcons: Record<string, typeof FileText> = {
  passport: FileBadge,
  contract: FileCheck,
  statement: FileText,
  id: FileKey,
  other: FileText,
};

const docTypeColors: Record<string, string> = {
  passport: "bg-blue-500/10 text-blue-400",
  contract: "bg-green-500/10 text-green-400",
  statement: "bg-purple-500/10 text-purple-400",
  id: "bg-orange-500/10 text-orange-400",
  other: "bg-muted text-muted-foreground",
};

export default function VaultPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const getLocale = () => {
    if (lang === "de") return de;
    if (lang === "en") return enGB;
    if (lang === "it") return it;
    return fr;
  };
  const locale = getLocale();
  
  const de_lang = lang === "de";
  const [filterType, setFilterType] = useState("all");
  const [dragOver, setDragOver] = useState(false);

  const docTypeLabels: Record<string, string> = {
    passport: t("vault_type_passport"), contract: t("vault_type_contract"),
    statement: t("vault_type_statement"), id: t("vault_type_id"), other: t("vault_type_other"),
  };

  const { data: documents, isLoading } = useQuery<Document[]>({ queryKey: ["/api/documents"] });

  const uploadDoc = useMutation({
    mutationFn: async (file: File) => {
      const docType = file.name.toLowerCase().includes("passport") || file.name.toLowerCase().includes("reisepass") ? "passport"
        : file.name.toLowerCase().includes("contrat") || file.name.toLowerCase().includes("vertrag") ? "contract"
        : file.name.toLowerCase().includes("releve") || file.name.toLowerCase().includes("auszug") ? "statement"
        : file.name.toLowerCase().includes("id") || file.name.toLowerCase().includes("ausweis") ? "id"
        : "other";
      await apiRequest("POST", "/api/documents", { name: file.name, type: docType, size: file.size, userId: "" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: t("vault_added"), description: t("vault_added_desc") });
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const deleteDoc = useMutation({
    mutationFn: async (docId: string) => { await apiRequest("DELETE", `/api/documents/${docId}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/documents"] }); toast({ title: t("vault_deleted") }); },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => uploadDoc.mutate(f));
    if (fileRef.current) fileRef.current.value = "";
  };

  const filteredDocs = filterType === "all" ? documents : documents?.filter(d => d.type === filterType);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-vault-title">{t("vault_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("vault_subtitle")}</p>
        </div>
        <div>
          <input type="file" ref={fileRef} className="hidden" onChange={e => handleFiles(e.target.files)} multiple data-testid="input-file-upload" />
          <Button onClick={() => fileRef.current?.click()} data-testid="button-upload-doc">
            <Upload className="w-4 h-4 mr-2" />{t("vault_upload")}
          </Button>
        </div>
      </div>

      {/* Encryption banner */}
      <Card className="border-gold/30 bg-gold/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-[hsl(222,40%,10%)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gold">{t("vault_encryption")}</p>
            <p className="text-xs text-muted-foreground">{t("vault_enc_desc")}</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-auto" />
        </CardContent>
      </Card>

      {/* Drag & Drop Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragOver ? "border-gold bg-gold/5" : "border-muted hover:border-muted-foreground/40"
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${dragOver ? "text-gold" : "text-muted-foreground/40"}`} />
        <p className="text-sm font-medium text-muted-foreground">
          {de_lang ? "Dateien hier ablegen oder klicken um hochzuladen" : lang === "en" ? "Drop files here or click to upload" : lang === "it" ? "Trascina i file qui o clicca per caricare" : "Déposez des fichiers ici ou cliquez pour uploader"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {de_lang ? "PDF, JPEG, PNG bis 10 MB" : lang === "en" ? "PDF, JPEG, PNG up to 10 MB" : lang === "it" ? "PDF, JPEG, PNG fino a 10 MB" : "PDF, JPEG, PNG jusqu'à 10 Mo"}
        </p>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{t("vault_my_docs")}</span>
            <Badge variant="secondary">{documents?.length || 0} {t("vault_files")}</Badge>
          </div>
          {documents && documents.length > 0 && (
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{de_lang ? "Alle Typen" : lang === "en" ? "All types" : lang === "it" ? "Tutti i tipi" : "Tous les types"}</SelectItem>
                <SelectItem value="passport">{t("vault_type_passport")}</SelectItem>
                <SelectItem value="contract">{t("vault_type_contract")}</SelectItem>
                <SelectItem value="statement">{t("vault_type_statement")}</SelectItem>
                <SelectItem value="id">{t("vault_type_id")}</SelectItem>
                <SelectItem value="other">{t("vault_type_other")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredDocs && filteredDocs.length > 0 ? (
            <div className="space-y-1">
              {filteredDocs.map(doc => {
                const Icon = docTypeIcons[doc.type] || FileText;
                const colorClass = docTypeColors[doc.type] || "bg-muted text-muted-foreground";
                return (
                  <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover-elevate group" data-testid={`row-document-${doc.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge variant="secondary" className="text-[10px]">{docTypeLabels[doc.type] || doc.type}</Badge>
                          <span className="text-xs text-muted-foreground">{formatSize(doc.size)}</span>
                          <span className="text-xs text-muted-foreground">{doc.uploadedAt ? format(new Date(doc.uploadedAt), "d MMM yyyy", { locale }) : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={de_lang ? "Anzeigen" : lang === "en" ? "View" : lang === "it" ? "Visualizza" : "Voir"}>
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDoc.mutate(doc.id)} data-testid={`button-delete-doc-${doc.id}`}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderLock className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{filterType !== "all" ? (de_lang ? "Keine Dokumente in dieser Kategorie" : lang === "en" ? "No documents in this category" : lang === "it" ? "Nessun documento in questa categoria" : "Aucun document dans cette catégorie") : t("vault_empty")}</p>
              {filterType === "all" && (
                <Button variant="secondary" className="mt-4" onClick={() => fileRef.current?.click()}>{t("vault_upload_first")}</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}