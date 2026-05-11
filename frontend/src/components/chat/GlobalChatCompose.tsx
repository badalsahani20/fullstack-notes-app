import { useState, useEffect } from "react";
import type { ReactNode, RefObject } from "react";
import { X, ImageIcon, Square, ArrowUp, Plus } from "lucide-react";
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
}: GlobalChatComposeProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input, textareaRef]);

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

  return (
    <div className="gc-compose-wrap">
      <div className="gc-compose">
        {topSlot}

        {attachedImage && (
          <div className="gc-img-preview-wrap">
            <div className="gc-img-preview">
              {attachedImage.startsWith("data:application/pdf") ? (
                <div className="flex items-center justify-center bg-[#2a2a2a] w-16 h-20 rounded-md">
                  <span className="text-xs font-bold text-gray-300">PDF</span>
                </div>
              ) : (
                <img src={attachedImage} alt="Attached" className="gc-img-thumb" />
              )}
              <button className="gc-img-remove" onClick={() => setAttachedImage(null)}>
                <X size={11} />
              </button>
            </div>
          </div>
        )}

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

        <div className="gc-compose-footer">
          <div className="relative">
            <button
              type="button"
              className="gc-icon-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Attach"
            >
              <Plus size={18} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a2a] border border-[#3f3f3f] rounded-lg p-1 shadow-xl flex flex-col gap-1 z-50 min-w-[100px]">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#3f3f3f] text-[13px] text-gray-200 transition-colors ${imageDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    handleImageClick();
                    setIsMenuOpen(false);
                  }}
                  title={imageDisabled ? "Image unavailable" : "Attach image"}
                >
                  <ImageIcon size={14} />
                  <span>Image / PDF</span>
                </button>
              </div>
            )}
          </div>
          <input type="file" ref={fileRef} accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />

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
              <ArrowUp size={15} />
            </button>
          )}
        </div>
      </div>
      <p className="gc-disclaimer">{disclaimerText}</p>
    </div>
  );
};
