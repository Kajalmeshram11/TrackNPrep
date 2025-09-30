import React from "react";
import { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ProfilePhotoSelector = ({ image, setImage, preview, setPreview }) => {
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const preview = URL.createObjectURL(file);
            if(setPreview) {
                setPreview(preview);
            }
            setPreviewUrl(preview);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        if(setPreview) {
            setPreview(null);
        }
        setPreviewUrl(null);
        inputRef.current.value = null;
    };

    const onChooseFile = () => {
        inputRef.current.click();
    }

    return (
        <div className="mb-4">
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImageChange}
                className="hidden"
            />
            <label className="text-[13px] text-slate-800 mb-1 block">
                Profile Photo
            </label>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    { (preview || previewUrl) ? (
                        <img
                            src={preview || previewUrl}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <LuUser className="text-slate-400" size={40} />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        className="btn-secondary px-3 py-1 text-sm flex items-center gap-2"
                        onClick={onChooseFile}
                    >
                        <LuUpload size={16} />
                        Choose Photo
                    </button>
                    {(image || preview || previewUrl) && (
                        <button
                            type="button"
                            className="btn-danger px-3 py-1 text-sm flex items-center gap-2"
                            onClick={handleRemoveImage}
                        >
                            <LuTrash size={16} />
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePhotoSelector;