"use client";

import { Checkbox } from "@/components/poll/Checkbox";
import { EmailField } from "@/components/poll/EmailField";
import { MultipleChoice } from "@/components/poll/MultipleChoice";
import { RatingScale } from "@/components/poll/RatingScale";
import { TextArea } from "@/components/poll/TextArea";
import { submitPollResponse, trackPageView } from "@/lib/actions/polls";
import { CustomPoll, CustomPollQuestion } from "@/types/poll";
import confetti from "canvas-confetti";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface PollFormProps {
  poll: CustomPoll;
}

export function PollForm({ poll }: PollFormProps) {
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") || "es";
  const isEnglish = lang === "en";

  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );
  const [answers, setAnswers] = useState<
    Record<string, string | number | string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalizedText = (es: string, en?: string) => {
    if (isEnglish && en) return en;
    return es;
  };

  const getQuestionText = (question: CustomPollQuestion) => {
    return getLocalizedText(question.question, question.questionEn);
  };

  const getQuestionOptions = (question: CustomPollQuestion) => {
    if (isEnglish && question.optionsEn && question.optionsEn.length > 0) {
      return question.optionsEn;
    }
    return question.options || [];
  };

  const questions = poll.questions;
  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  const getCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return undefined;
    return answers[currentQuestion.id.toString()];
  }, [answers, currentQuestion]);

  const isCurrentStepValid = useCallback(() => {
    if (!currentQuestion) return false;
    const answer = getCurrentAnswer();
    if (!currentQuestion.required) return true;

    switch (currentQuestion.type) {
      case "email":
        return (
          typeof answer === "string" &&
          answer.includes("@") &&
          answer.length > 3
        );
      case "rating":
        return typeof answer === "number" && answer >= 1 && answer <= 5;
      case "text":
        return typeof answer === "string" && answer.trim().length > 0;
      case "multiple_choice":
        return typeof answer === "string" && answer.length > 0;
      case "checkbox":
        return Array.isArray(answer) && answer.length > 0;
      default:
        return true;
    }
  }, [currentQuestion, getCurrentAnswer]);

  // Track page view on mount
  useEffect(() => {
    trackPageView(poll.id);
  }, [poll.id]);

  // Set dynamic favicon from poll logo
  useEffect(() => {
    if (poll.logoUrl) {
      const existingFavicon = document.querySelector(
        'link[rel="icon"]',
      ) as HTMLLinkElement;
      if (existingFavicon) {
        existingFavicon.href = poll.logoUrl;
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = poll.logoUrl;
        document.head.appendChild(link);
      }
    }
  }, [poll.logoUrl]);

  // Trigger confetti on successful submission
  useEffect(() => {
    if (isSubmitted) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FF453A"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isSubmitted]);

  // Keyboard navigation
  useEffect(() => {
    if (poll.status !== "active" || isSubmitted || !currentQuestion) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Enter" && currentQuestion.type !== "text") {
        e.preventDefault();
        if (isCurrentStepValid()) {
          if (currentStep === totalSteps - 1) {
            await handleSubmit();
          } else {
            setError(null);
            setSlideDirection("right");
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    poll.status,
    isSubmitted,
    currentStep,
    currentQuestion,
    totalSteps,
    isCurrentStepValid,
  ]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setCurrentAnswer = (value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id.toString()]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      setError(
        isEnglish
          ? "Please complete this question"
          : "Por favor completa esta pregunta",
      );
      return;
    }
    setError(null);
    setSlideDirection("right");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrevious = () => {
    setError(null);
    setSlideDirection("left");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!isCurrentStepValid()) {
      setError(
        isEnglish
          ? "Please complete this question"
          : "Por favor completa esta pregunta",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitPollResponse(poll.id, answers);
      setIsSubmitted(true);
    } catch {
      setError(
        isEnglish
          ? "Failed to submit. Please try again."
          : "Error al enviar. Por favor intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const whatsappMessage = encodeURIComponent(
      isEnglish
        ? "Hi! I just completed the survey and would like to get my 5% discount on my next shipment. Thank you!"
        : "¡Hola! Acabo de completar la encuesta y me gustaría obtener mi 5% de descuento en mi próximo envío. ¡Gracias!",
    );
    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "1234567890";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="bg-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {isEnglish ? "Thank you!" : "¡Gracias!"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isEnglish
                ? "Your response has been recorded."
                : "Tu respuesta ha sido registrada."}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] text-white font-medium rounded-xl transition-all hover:bg-[#1da851] hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {isEnglish
                ? "Get 5% off your next order"
                : "Obtén 5% de descuento"}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  const renderQuestion = (question: CustomPollQuestion) => {
    const answer = getCurrentAnswer();
    const questionText = getQuestionText(question);
    const options = getQuestionOptions(question);

    switch (question.type) {
      case "email":
        return (
          <EmailField
            id={question.id.toString()}
            question={questionText}
            value={(answer as string) || ""}
            onChange={(v) => setCurrentAnswer(v)}
            required={question.required}
            isEnglish={isEnglish}
          />
        );
      case "rating":
        return (
          <RatingScale
            id={question.id.toString()}
            question={questionText}
            value={(answer as number) || 0}
            onChange={(v) => setCurrentAnswer(v)}
            required={question.required}
            isEnglish={isEnglish}
          />
        );
      case "text":
        return (
          <TextArea
            id={question.id.toString()}
            question={questionText}
            value={(answer as string) || ""}
            onChange={(v) => setCurrentAnswer(v)}
            required={question.required}
            isEnglish={isEnglish}
          />
        );
      case "multiple_choice":
        return (
          <MultipleChoice
            id={question.id.toString()}
            question={questionText}
            options={options}
            value={(answer as string) || ""}
            onChange={(v) => setCurrentAnswer(v)}
            required={question.required}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            id={question.id.toString()}
            question={questionText}
            options={options}
            value={(answer as string[]) || []}
            onChange={(v) => setCurrentAnswer(v)}
            required={question.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-lg py-3 flex items-center gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-[15px] truncate">
                {getLocalizedText(poll.title, poll.titleEn)}
              </p>
              {poll.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {getLocalizedText(poll.description, poll.descriptionEn)}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Logo */}
            {poll.logoUrl && (
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poll.logoUrl}
                  alt=""
                  className="w-40 h-40 object-contain border border-border/30 rounded-full shadow-sm"
                />
              </div>
            )}

            {/* Step Counter */}
            <div className="mb-3 text-right">
              <span className="text-sm text-muted-foreground tabular-nums">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>

            {/* Question Card */}
            <div
              key={currentStep}
              className={`bg-card rounded-2xl p-6 sm:p-8 ${
                slideDirection === "right"
                  ? "animate-slide-in-from-right"
                  : "animate-slide-in-from-left"
              }`}
            >
              {/* Question */}
              <div className="mb-6">{renderQuestion(currentQuestion)}</div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 rounded-xl animate-shake">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex-1 py-3 text-[15px] font-medium bg-secondary rounded-xl disabled:opacity-30 cursor-pointer transition-all hover:bg-secondary/80 active:scale-[0.98]"
                >
                  {isEnglish ? "Back" : "Atrás"}
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-[15px] font-medium text-white bg-primary rounded-xl disabled:opacity-50 cursor-pointer transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting
                      ? isEnglish
                        ? "Submitting..."
                        : "Enviando..."
                      : isEnglish
                        ? "Submit"
                        : "Enviar"}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 text-[15px] font-medium text-white bg-primary rounded-xl cursor-pointer transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isEnglish ? "Continue" : "Continuar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4">
        <p className="text-xs text-muted-foreground text-center">
          {isEnglish
            ? "Your responses are confidential"
            : "Tus respuestas son confidenciales"}
        </p>
      </footer>
    </div>
  );
}
