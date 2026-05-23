import axios from "axios";

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);

    return response.data.secure_url;
}

export const prepareChatImage = async (image?: string | null) => {
    if (!image) {
        return {
            imageForApi: null,
            imageUrl: undefined,
        };
    }

    if (image.startsWith("data:image/")) {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "chat-image.png", {
            type: blob.type || "image/png",
        });
        const uploadedUrl = await uploadImage(file);

        return {
            imageForApi: uploadedUrl || null,
            imageUrl: uploadedUrl || undefined,
        };
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return {
            imageForApi: image,
            imageUrl: image,
        };
    }

    return {
        imageForApi: image,
        imageUrl: image,
    };
};
