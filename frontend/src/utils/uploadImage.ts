import axios from "axios";

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);

    return response.data.secure_url;
}