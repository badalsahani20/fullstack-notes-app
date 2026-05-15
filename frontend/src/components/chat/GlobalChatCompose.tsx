import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode, RefObject } from "react";
import { X, ImageIcon, Square, ArrowUp, Plus, FileText, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface GlobalChatComposeProps {
  input: string;
  setInput: (value: string) => void;
  attachedImage: string | null;
  setAttachedImage: (image: string | null) => void;
  isSending: boolean;
  imageDisabled: boolean;
  handleSend: () => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileRef: RefObject<HTMLInputElement | null>;
  topSlot?: ReactNode;
  placeholder?: string;
  onStop?: () => void;
  disclaimerText?: string;
  useReasoning?: boolean;
  setUseReasoning?: (val: boolean) => void;
}

export const GlobalChatCompose = ({
  input,
  setInput,
  attachedImage,
  setAttachedImage,
  isSending,
  imageDisabled,
  handleSend,
  textareaRef,
  fileRef,
  topSlot,
  placeholder = "Ask Iris anything...",
  onStop,
  disclaimerText = "Iris can make mistakes. Double-check important info.",
  useReasoning = true,
  setUseReasoning,
}: GlobalChatComposeProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fileAccept, setFileAccept] = useState("image/*,.pdf");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (input) {
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 160) + "px";
      }
    }
  }, [input, textareaRef]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File must be less than 15 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImageClick = () => {
    if (imageDisabled) {
      toast.error("Image analysis is temporarily unavailable. Try again later.");
      return;
    }
    fileRef.current?.click();
  };

  const openFilePicker = (accept: string) => {
    setFileAccept(accept);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const isPdf = attachedImage?.startsWith("data:application/pdf");

  return (
    <div className="gc-compose-wrap">
      <div className="gc-compose">
        {topSlot}

        {attachedImage && (
          <div className="gc-img-preview-wrap">
            <div className="gc-img-preview">
              {isPdf ? (
                <div className="gc-pdf-thumb">
                  <FileText size={18} />
                  <span className="gc-pdf-thumb-label">PDF</span>
                </div>
              ) : (
                <img
                  src={attachedImage}
                  alt="Attached"
                  className="gc-img-thumb"
                  onClick={() => setLightboxOpen(true)}
                  style={{ cursor: "zoom-in" }}
                  title="Click to preview"
                />
              )}
              <button
                className="gc-img-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setAttachedImage(null);
                  setLightboxOpen(false);
                }}
                title="Remove"
              >
                <X size={9} />
              </button>
            </div>
          </div>
        )}

        <div className="gc-compose-footer">
          <div className="relative" ref={attachMenuRef}>
            <button
              type="button"
              className="gc-icon-btn gc-compose-plus"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Attach"
            >
              <Plus size={18} />
            </button>

            {isMenuOpen && (
              <div className="gc-attach-menu">
                <button
                  type="button"
                  className={`gc-attach-option ${imageDisabled ? "gc-attach-option-disabled" : ""}`}
                  onClick={() => {
                    if (imageDisabled) {
                      handleImageClick();
                    } else {
                      openFilePicker("image/*");
                    }
                    setIsMenuOpen(false);
                  }}
                  title={imageDisabled ? "Image unavailable" : "Attach image"}
                >
                  <span className="gc-attach-option-icon gc-attach-option-image">
                    <ImageIcon size={16} />
                  </span>
                  <span className="gc-attach-option-copy">
                    <span>Image</span>
                    <small>PNG, JPG, WebP</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="gc-attach-option"
                  onClick={() => {
                    openFilePicker(".pdf,application/pdf");
                    setIsMenuOpen(false);
                  }}
                  title="Attach PDF"
                >
                  <span className="gc-attach-option-icon gc-attach-option-pdf">
                    <FileText size={16} />
                  </span>
                  <span className="gc-attach-option-copy">
                    <span>PDF</span>
                    <small>Documents up to 15 MB</small>
                  </span>
                </button>

                {setUseReasoning && (
                  <button
                    type="button"
                    className="gc-attach-option"
                    onClick={() => {
                      setUseReasoning(!useReasoning);
                      setIsMenuOpen(false);
                    }}
                    title={useReasoning ? "Turn off reasoning" : "Turn on reasoning"}
                  >
                    <span className="gc-attach-option-icon" style={{ color: useReasoning ? "var(--primary-color)" : "inherit" }}>
                      <Lightbulb size={16} />
                    </span>
                    <span className="gc-attach-option-copy">
                      <span>Thinking</span>
                      <small>{useReasoning ? "Active (Higher quality)" : "Off (Faster)"}</small>
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileRef}
            accept={fileAccept}
            className="hidden"
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            className="gc-textarea custom-scrollbar"
            placeholder={placeholder}
            rows={1}
            value={input}
            disabled={isSending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {useReasoning && (
            <div className="gc-reasoning-status" title="Thinking is active" style={{ color: "var(--primary-color)", opacity: 0.8, display: "flex", alignItems: "center", marginRight: "6px" }}>
              <Lightbulb size={14} />
            </div>
          )}

          {isSending ? (
            <button
              type="button"
              className="gc-send-btn gc-send-btn-stop"
              onClick={onStop}
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              className="gc-send-btn"
              disabled={!input.trim() && !attachedImage}
              onClick={handleSend}
            >
              <ArrowUp size={17} />
            </button>
          )}
        </div>
      </div>
      <p className="gc-disclaimer">{disclaimerText}</p>

      {/* Lightbox — portal-rendered outside compose box */}
      {lightboxOpen &&
        attachedImage &&
        !isPdf &&
        createPortal(
          <div
            className="gc-lightbox-overlay"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className="gc-lightbox-inner"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={attachedImage} alt="Preview" className="gc-lightbox-img" />
              <button
                className="gc-lightbox-close"
                onClick={() => setLightboxOpen(false)}
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
