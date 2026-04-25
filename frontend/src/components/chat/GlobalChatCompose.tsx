import { X, ImageIcon, Square, ArrowUp } from "lucide-react";
import { toast } from "sonner";

interface GlobalChatComposeProps {
  input: string;
  setInput: (value: string) => void;
  attachedImage: string | null;
  setAttachedImage: (image: string | null) => void;
  isSending: boolean;
  imageDisabled: boolean;
  handleSend: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileRef: React.RefObject<HTMLInputElement | null>;
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
}: GlobalChatComposeProps) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
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
        {attachedImage && (
          <div className="gc-img-preview-wrap">
            <div className="gc-img-preview">
              <img src={attachedImage} alt="Attached" className="gc-img-thumb" />
              <button className="gc-img-remove" onClick={() => setAttachedImage(null)}>
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="gc-textarea custom-scrollbar"
          placeholder="Ask Iris anything…"
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
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
          }}
        />

        <div className="gc-compose-footer">
          <button
            type="button"
            className={`gc-icon-btn ${imageDisabled ? "gc-icon-btn-disabled" : ""}`}
            onClick={handleImageClick}
            title={imageDisabled ? "Image unavailable" : "Attach image"}
          >
            <ImageIcon size={15} />
          </button>
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />

          {isSending ? (
            <button type="button" className="gc-send-btn gc-send-btn-stop">
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
      <p className="gc-disclaimer">Iris can make mistakes. Double-check important info.</p>
    </div>
  );
};
