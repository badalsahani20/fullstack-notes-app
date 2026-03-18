import Image from "@tiptap/extension-image";
import { Plugin, PluginKey } from "prosemirror-state";
import { uploadImage } from "@/utils/uploadImage";
import { toast } from "sonner";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageNodeView from "./ImageNodeView";

export const ImageUploadExtension = Image.extend({
     addNodeView() {
         return ReactNodeViewRenderer(ImageNodeView);
     },
     addProseMirrorPlugins() {
        return [
            new Plugin ({
                key: new PluginKey("imageDropPaste"),
                props: {
                    handlePaste(view, event, _slice) {
                        const items = Array.from(event.clipboardData?.items || []);
                        const imageItems = items.filter((item) => item.type.includes("image"));

                        if(imageItems.length === 0) return false;
                        event.preventDefault();
                        imageItems.forEach(async (item) => {
                            const file = item.getAsFile();
                            if(!file) return;
                            
                            const toastId = toast.loading("Pasting image...");
                            try {
                                const url = await uploadImage(file);
                                const {schema} = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                                toast.success("Image added!", { id: toastId });
                            } catch (error) {
                                console.error("Paste error:", error);
                                toast.error("Failed to add image", { id: toastId });
                            }
                        });
                        return true;
                    },
                    handleDrop(view, event, _slice, moved) {
                        if(moved || !event.dataTransfer || !event.dataTransfer.files.length) return false;
                        const files = Array.from(event.dataTransfer.files).filter((file) => file.type.includes("image"));
                        if(files.length === 0) return false;
                        event.preventDefault();
                        
                        const coordinates = view.posAtCoords({
                            left: event.clientX,
                            top: event.clientY
                        });

                        if(!coordinates) return false;
                        files.forEach(async (file) => {
                            const toastId = toast.loading("Uploading dropped image...");
                            try {
                                const url = await uploadImage(file);

                                const {schema} = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.insert(coordinates.pos, node);
                                view.dispatch(transaction);
                                toast.success("Image Uploaded!", { id: toastId });
                            } catch (error) {
                                console.error("Drop error:", error);
                                toast.error("Failed to upload image", { id: toastId });
                            }
                        })
                        return true;
                    }
                }
            })
        ]
     }
})