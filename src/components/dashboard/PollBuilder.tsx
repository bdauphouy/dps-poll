"use client";

import { Input } from "@/components/ui/input";
import { CustomPoll, PollBuilderQuestion, QuestionType } from "@/types/poll";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import imageCompression from "browser-image-compression";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";

interface PollBuilderProps {
  editingPoll?: CustomPoll | null;
  onSave: (data: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    logoUrl: string;
    questions: PollBuilderQuestion[];
  }) => Promise<void>;
  onCancel: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: "email", label: "Email", icon: "✉️" },
  { value: "rating", label: "Rating", icon: "⭐" },
  { value: "text", label: "Text", icon: "📝" },
  { value: "multiple_choice", label: "Choice", icon: "○" },
  { value: "checkbox", label: "Multi", icon: "☑️" },
];

// Drag handle component
function DragHandle({
  listeners,
  attributes,
}: {
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
}) {
  return (
    <button
      className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      {...listeners}
      {...attributes}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    </button>
  );
}

// Sortable question wrapper
function SortableQuestionItem({
  question,
  index,
  isExpanded,
  isActive,
  typeInfo,
  editLang,
  onToggleExpand,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  children,
}: {
  question: PollBuilderQuestion;
  index: number;
  isExpanded: boolean;
  isActive: boolean;
  typeInfo: { value: QuestionType; label: string; icon: string } | undefined;
  editLang: "es" | "en";
  onToggleExpand: () => void;
  onUpdateQuestion: (id: string, updates: Partial<PollBuilderQuestion>) => void;
  onRemoveQuestion: (id: string) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (
    questionId: string,
    optionIndex: number,
    value: string,
    isEnglish: boolean,
  ) => void;
  onRemoveOption: (questionId: string, optionIndex: number) => void;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-b border-border/50 last:border-b-0 ${isActive ? "bg-primary/5" : ""}`}
    >
      {/* Question Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <DragHandle listeners={listeners} attributes={attributes} />
        <div
          className="flex-1 flex items-center gap-3 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px]">{question.question || "New Question"}</p>
            <p className="text-xs text-muted-foreground">
              {typeInfo?.label}
              {question.required && " · Required"}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-muted-foreground/50 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-4 space-y-4 bg-secondary/30">
          {/* Question Type Selector */}
          <div className="flex gap-1 p-1 bg-secondary rounded-lg">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  onUpdateQuestion(question.id, {
                    type: type.value,
                    options: ["multiple_choice", "checkbox"].includes(
                      type.value,
                    )
                      ? question.options.length > 0
                        ? question.options
                        : [""]
                      : [],
                    optionsEn: ["multiple_choice", "checkbox"].includes(
                      type.value,
                    )
                      ? question.optionsEn.length > 0
                        ? question.optionsEn
                        : [""]
                      : [],
                  })
                }
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  question.type === type.value
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Question Text */}
          <Input
            value={editLang === "es" ? question.question : question.questionEn}
            onChange={(e) =>
              onUpdateQuestion(question.id, {
                [editLang === "es" ? "question" : "questionEn"]: e.target.value,
              })
            }
            placeholder={editLang === "es" ? "Pregunta..." : "Question..."}
            className="bg-card border-0"
          />

          {/* Options for multiple choice / checkbox */}
          {(question.type === "multiple_choice" ||
            question.type === "checkbox") && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 text-center">
                    {question.type === "multiple_choice" ? "○" : "☐"}
                  </span>
                  <Input
                    value={
                      editLang === "es"
                        ? option
                        : question.optionsEn[optIndex] || ""
                    }
                    onChange={(e) =>
                      onUpdateOption(
                        question.id,
                        optIndex,
                        e.target.value,
                        editLang === "en",
                      )
                    }
                    placeholder={
                      editLang === "es"
                        ? `Opción ${optIndex + 1}`
                        : `Option ${optIndex + 1}`
                    }
                    className="flex-1 bg-card border-0 h-9 text-sm"
                  />
                  <button
                    onClick={() => onRemoveOption(question.id, optIndex)}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddOption(question.id)}
                className="text-sm text-primary font-medium cursor-pointer"
              >
                + {editLang === "es" ? "Añadir opción" : "Add Option"}
              </button>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-[15px]">Required</span>
            <button
              onClick={() =>
                onUpdateQuestion(question.id, { required: !question.required })
              }
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer ${
                question.required ? "bg-primary" : "bg-secondary"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                  question.required ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end pt-2 border-t border-border/50">
            <button
              onClick={() => onRemoveQuestion(question.id)}
              className="px-3 py-1.5 text-sm text-destructive cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PollBuilder({
  editingPoll,
  onSave,
  onCancel,
}: PollBuilderProps) {
  const [title, setTitle] = useState(editingPoll?.title || "");
  const [titleEn, setTitleEn] = useState(editingPoll?.titleEn || "");
  const [description, setDescription] = useState(
    editingPoll?.description || "",
  );
  const [descriptionEn, setDescriptionEn] = useState(
    editingPoll?.descriptionEn || "",
  );
  const [logoUrl, setLogoUrl] = useState(editingPoll?.logoUrl || "");
  const [questions, setQuestions] = useState<PollBuilderQuestion[]>(
    editingPoll?.questions.map((q) => ({
      id: q.id.toString(),
      type: q.type,
      question: q.question,
      questionEn: q.questionEn || "",
      options: q.options || [],
      optionsEn: q.optionsEn || [],
      required: q.required,
    })) || [],
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [editLang, setEditLang] = useState<"es" | "en">("es");
  const [previewLang, setPreviewLang] = useState<"es" | "en">("es");
  const [previewStep, setPreviewStep] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingLogo(true);

    try {
      // Compress image to max 100KB and 512px
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setIsCompressingLogo(false);
      };
      reader.onerror = () => {
        setIsCompressingLogo(false);
        alert("Failed to read image");
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      setIsCompressingLogo(false);
      alert("Failed to process image");
    }
  };

  const removeLogo = () => {
    setLogoUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addQuestion = () => {
    const newId = nanoid(6);
    setQuestions([
      ...questions,
      {
        id: newId,
        type: "text",
        question: "",
        questionEn: "",
        options: [],
        optionsEn: [],
        required: true,
      },
    ]);
    setExpandedQuestion(newId);
  };

  const updateQuestion = (
    id: string,
    updates: Partial<PollBuilderQuestion>,
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (previewStep >= questions.length - 1) {
      setPreviewStep(Math.max(0, questions.length - 2));
    }
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
      if (previewStep === oldIndex) {
        setPreviewStep(newIndex);
      } else if (previewStep === newIndex) {
        setPreviewStep(oldIndex);
      }
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, ""],
        optionsEn: [...question.optionsEn, ""],
      });
    }
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string,
    isEnglish: boolean = false,
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      if (isEnglish) {
        const newOptionsEn = [...question.optionsEn];
        newOptionsEn[optionIndex] = value;
        updateQuestion(questionId, { optionsEn: newOptionsEn });
      } else {
        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        updateQuestion(questionId, { options: newOptions });
      }
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex),
        optionsEn: question.optionsEn.filter((_, i) => i !== optionIndex),
      });
    }
  };

  const handleTranslate = async () => {
    type TranslationItem = {
      type: "title" | "description" | "question" | "option";
      text: string;
      questionIdx?: number;
      optionIdx?: number;
    };

    const itemsToTranslate: TranslationItem[] = [];

    if (!titleEn.trim() && title.trim()) {
      itemsToTranslate.push({ type: "title", text: title });
    }
    if (!descriptionEn.trim() && description.trim()) {
      itemsToTranslate.push({ type: "description", text: description });
    }

    questions.forEach((q, qIdx) => {
      if (!q.questionEn?.trim() && q.question.trim()) {
        itemsToTranslate.push({
          type: "question",
          text: q.question,
          questionIdx: qIdx,
        });
      }
      q.options.forEach((opt, optIdx) => {
        const optEn = q.optionsEn[optIdx];
        if (!optEn?.trim() && opt.trim()) {
          itemsToTranslate.push({
            type: "option",
            text: opt,
            questionIdx: qIdx,
            optionIdx: optIdx,
          });
        }
      });
    });

    if (itemsToTranslate.length === 0) {
      alert("Nothing to translate - all English fields are already filled.");
      return;
    }

    setIsTranslating(true);

    try {
      const textsToTranslate = itemsToTranslate.map((item) => item.text);

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: textsToTranslate,
          source: "es",
          target: "en",
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      const translations: string[] = data.translations;

      let newTitleEn = titleEn;
      let newDescriptionEn = descriptionEn;
      const newQuestions = [...questions];

      itemsToTranslate.forEach((item, idx) => {
        const translation = translations[idx];
        switch (item.type) {
          case "title":
            newTitleEn = translation;
            break;
          case "description":
            newDescriptionEn = translation;
            break;
          case "question":
            newQuestions[item.questionIdx!] = {
              ...newQuestions[item.questionIdx!],
              questionEn: translation,
            };
            break;
          case "option":
            const q = newQuestions[item.questionIdx!];
            const newOptionsEn = [...q.optionsEn];
            newOptionsEn[item.optionIdx!] = translation;
            newQuestions[item.questionIdx!] = { ...q, optionsEn: newOptionsEn };
            break;
        }
      });

      setTitleEn(newTitleEn);
      setDescriptionEn(newDescriptionEn);
      setQuestions(newQuestions);
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    if (questions.length === 0) return;
    if (questions.some((q) => !q.question.trim())) return;

    setIsSaving(true);
    try {
      await onSave({
        title,
        titleEn,
        description,
        descriptionEn,
        logoUrl,
        questions,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Preview helpers
  const getPreviewTitle = () =>
    previewLang === "en" && titleEn ? titleEn : title || "Untitled Poll";
  const getPreviewDescription = () =>
    previewLang === "en" && descriptionEn ? descriptionEn : description;
  const getPreviewQuestion = (q: PollBuilderQuestion) =>
    previewLang === "en" && q.questionEn
      ? q.questionEn
      : q.question || "Question...";
  const getPreviewOptions = (q: PollBuilderQuestion) =>
    previewLang === "en" && q.optionsEn.length > 0 ? q.optionsEn : q.options;
  const currentPreviewQuestion = questions[previewStep];

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Render preview content (shared between desktop and mobile)
  const renderPreviewContent = () => (
    <div className="max-w-sm mx-auto">
      {/* Language Toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex p-0.5 bg-secondary rounded-lg">
          <button
            onClick={() => setPreviewLang("es")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
              previewLang === "es"
                ? "bg-card shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setPreviewLang("en")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
              previewLang === "en"
                ? "bg-card shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="bg-card rounded-[2.5rem] p-3 shadow-xl border border-border/50">
        <div className="bg-background rounded-[2rem] overflow-hidden flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="px-4 py-4">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {getPreviewTitle()}
              </p>
              {getPreviewDescription() && (
                <p className="text-xs text-muted-foreground truncate">
                  {getPreviewDescription()}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-secondary mx-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: `${questions.length > 0 ? ((previewStep + 1) / questions.length) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-4">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                Add a question to preview
              </p>
            ) : currentPreviewQuestion ? (
              <div className="w-full">
                {/* Logo */}
                {logoUrl && (
                  <div className="flex justify-center mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt=""
                      className="w-32 h-32 object-contain border border-border/30 rounded-full shadow-sm"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-right mb-3">
                  {previewStep + 1} / {questions.length}
                </p>
                <div className="bg-card rounded-2xl p-5">
                  <h3 className="text-base font-semibold mb-4 line-clamp-2">
                    {getPreviewQuestion(currentPreviewQuestion)}
                  </h3>

                  {currentPreviewQuestion.type === "email" && (
                    <div className="h-11 bg-secondary rounded-xl px-4 flex items-center text-sm text-muted-foreground">
                      {previewLang === "es"
                        ? "tu@correo.com"
                        : "your@email.com"}
                    </div>
                  )}

                  {currentPreviewQuestion.type === "text" && (
                    <div className="h-24 bg-secondary rounded-xl p-4 text-sm text-muted-foreground">
                      {previewLang === "es"
                        ? "Escribe tu respuesta..."
                        : "Type your answer..."}
                    </div>
                  )}

                  {currentPreviewQuestion.type === "rating" && (
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentPreviewQuestion.type === "multiple_choice" && (
                    <div className="space-y-2">
                      {getPreviewOptions(currentPreviewQuestion).map(
                        (opt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary text-sm"
                          >
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                            <span>{opt || `Option ${i + 1}`}</span>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {currentPreviewQuestion.type === "checkbox" && (
                    <div className="space-y-2">
                      {getPreviewOptions(currentPreviewQuestion).map(
                        (opt, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary text-sm"
                          >
                            <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
                            <span>{opt || `Option ${i + 1}`}</span>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 mt-6">
                    <div className="flex-1 h-11 bg-secondary rounded-xl flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {previewLang === "es" ? "Atrás" : "Back"}
                    </div>
                    <div className="flex-1 h-11 bg-primary rounded-xl flex items-center justify-center text-sm font-medium text-white">
                      {previewStep === questions.length - 1
                        ? previewLang === "es"
                          ? "Enviar"
                          : "Submit"
                        : previewLang === "es"
                          ? "Continuar"
                          : "Continue"}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Preview Navigation Dots */}
          {questions.length > 1 && (
            <div className="pb-6 flex items-center justify-center gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewStep(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === previewStep ? "bg-primary w-4" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[calc(100vh-180px)] min-h-[400px] lg:min-h-[600px]">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* iOS-style large title */}
        <div className="mb-4 lg:mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {editingPoll ? "Edit Survey" : "New Survey"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm lg:text-base">
              Create your survey in Spanish, then translate to English
            </p>
          </div>
          {/* Mobile Preview Button */}
          <button
            onClick={() => setShowMobilePreview(true)}
            className="lg:hidden px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl cursor-pointer"
          >
            Preview
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex p-0.5 bg-secondary rounded-lg">
              <button
                onClick={() => {
                  setEditLang("es");
                  setPreviewLang("es");
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  editLang === "es"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Spanish
              </button>
              <button
                onClick={() => {
                  setEditLang("en");
                  setPreviewLang("en");
                }}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  editLang === "en"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                English
              </button>
            </div>
            {editLang === "es" && (
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !title.trim()}
                className="text-sm text-primary font-medium disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                {isTranslating ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Translating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    Translate to English
                  </>
                )}
              </button>
            )}
          </div>

          {/* Settings Group */}
          <div>
            <p className="text-sm font-medium text-muted-foreground px-4 mb-2">
              Settings
            </p>
            <div className="bg-card rounded-xl overflow-hidden">
              {/* Logo Row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <span className="text-[15px]">Logo</span>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt=""
                        className="w-8 h-8 rounded-lg object-contain bg-secondary"
                      />
                      <button
                        onClick={removeLogo}
                        className="text-destructive text-[15px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : isCompressingLogo ? (
                    <span className="text-muted-foreground text-[15px] flex items-center gap-1.5">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Compressing...
                    </span>
                  ) : (
                    <label className="text-primary text-[15px] cursor-pointer">
                      Upload
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <svg
                    className="w-4 h-4 text-muted-foreground/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] w-24 shrink-0">Title</span>
                  <input
                    value={editLang === "es" ? title : titleEn}
                    onChange={(e) =>
                      editLang === "es"
                        ? setTitle(e.target.value)
                        : setTitleEn(e.target.value)
                    }
                    placeholder={
                      editLang === "es"
                        ? "Título de la encuesta..."
                        : "Survey title..."
                    }
                    className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-[15px] w-24 shrink-0">Description</span>
                  <input
                    value={editLang === "es" ? description : descriptionEn}
                    onChange={(e) =>
                      editLang === "es"
                        ? setDescription(e.target.value)
                        : setDescriptionEn(e.target.value)
                    }
                    placeholder={
                      editLang === "es"
                        ? "Descripción opcional..."
                        : "Optional description..."
                    }
                    className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions Group */}
          <div>
            <p className="text-sm font-medium text-muted-foreground px-4 mb-2">
              Questions ({questions.length})
            </p>

            <div className="bg-card rounded-xl overflow-hidden">
              {questions.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  No questions yet. Add your first question below.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {questions.map((question, index) => (
                      <SortableQuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        isExpanded={expandedQuestion === question.id}
                        isActive={previewStep === index}
                        typeInfo={QUESTION_TYPES.find(
                          (t) => t.value === question.type,
                        )}
                        editLang={editLang}
                        onToggleExpand={() => {
                          setExpandedQuestion(
                            expandedQuestion === question.id
                              ? null
                              : question.id,
                          );
                          setPreviewStep(index);
                        }}
                        onUpdateQuestion={updateQuestion}
                        onRemoveQuestion={removeQuestion}
                        onAddOption={addOption}
                        onUpdateOption={updateOption}
                        onRemoveOption={removeOption}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}

              {/* Add Question Button */}
              <button
                onClick={addQuestion}
                className="w-full px-4 py-3 text-primary text-[15px] font-medium text-left cursor-pointer hover:bg-primary/5 transition-colors"
              >
                + Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 py-3 text-[15px] font-medium text-foreground bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || questions.length === 0 || isSaving}
            className="flex-1 py-3 text-[15px] font-medium text-white bg-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </>
            ) : editingPoll ? (
              "Save Changes"
            ) : (
              "Create Survey"
            )}
          </button>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <p className="text-lg font-semibold">Preview</p>
            <button
              onClick={() => setShowMobilePreview(false)}
              className="px-4 py-2 text-sm font-medium bg-secondary rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderPreviewContent()}
          </div>
        </div>
      )}

      {/* Right: Preview (Desktop only) */}
      <div className="hidden lg:flex w-[380px] flex-col">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Preview</p>
          {/* iOS-style Segmented Control */}
          <div className="flex p-0.5 bg-secondary rounded-lg">
            <button
              onClick={() => setPreviewLang("es")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                previewLang === "es"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setPreviewLang("en")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                previewLang === "en"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Phone Frame */}
        <div className="flex-1 bg-card rounded-[2.5rem] p-3 shadow-xl border border-border/50">
          <div className="h-full bg-background rounded-[2rem] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {getPreviewTitle()}
                </p>
                {getPreviewDescription() && (
                  <p className="text-xs text-muted-foreground truncate">
                    {getPreviewDescription()}
                  </p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 bg-secondary mx-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${
                    questions.length > 0
                      ? ((previewStep + 1) / questions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
              {questions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Add a question to preview
                </p>
              ) : currentPreviewQuestion ? (
                <div className="w-full">
                  {/* Logo */}
                  {logoUrl && (
                    <div className="flex justify-center mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt=""
                        className="w-32 h-32 object-contain border border-border/30 rounded-full shadow-sm"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground text-right mb-3">
                    {previewStep + 1} / {questions.length}
                  </p>

                  <div className="bg-card rounded-2xl p-5">
                    <h3 className="text-base font-semibold mb-4 line-clamp-2">
                      {getPreviewQuestion(currentPreviewQuestion)}
                    </h3>

                    {currentPreviewQuestion.type === "email" && (
                      <div className="h-11 bg-secondary rounded-xl px-4 flex items-center text-sm text-muted-foreground">
                        {previewLang === "es"
                          ? "tu@correo.com"
                          : "your@email.com"}
                      </div>
                    )}

                    {currentPreviewQuestion.type === "text" && (
                      <div className="h-24 bg-secondary rounded-xl p-4 text-sm text-muted-foreground">
                        {previewLang === "es"
                          ? "Escribe tu respuesta..."
                          : "Type your answer..."}
                      </div>
                    )}

                    {currentPreviewQuestion.type === "rating" && (
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-sm font-medium text-muted-foreground"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    )}

                    {currentPreviewQuestion.type === "multiple_choice" && (
                      <div className="space-y-2">
                        {getPreviewOptions(currentPreviewQuestion).map(
                          (opt, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-xl bg-secondary text-sm"
                            >
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                              <span>{opt || `Option ${i + 1}`}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {currentPreviewQuestion.type === "checkbox" && (
                      <div className="space-y-2">
                        {getPreviewOptions(currentPreviewQuestion).map(
                          (opt, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-xl bg-secondary text-sm"
                            >
                              <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
                              <span>{opt || `Option ${i + 1}`}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-6">
                      <div className="flex-1 h-11 bg-secondary rounded-xl flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {previewLang === "es" ? "Atrás" : "Back"}
                      </div>
                      <div className="flex-1 h-11 bg-primary rounded-xl flex items-center justify-center text-sm font-medium text-white">
                        {previewStep === questions.length - 1
                          ? previewLang === "es"
                            ? "Enviar"
                            : "Submit"
                          : previewLang === "es"
                            ? "Continuar"
                            : "Continue"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Preview Navigation Dots */}
            {questions.length > 1 && (
              <div className="pb-6 flex items-center justify-center gap-2">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewStep(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      i === previewStep ? "bg-primary w-4" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
