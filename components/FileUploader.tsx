"use client";

import Image from "next/image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
};

export const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return convertFileToUrl(file);
    }
    if (file.type === "application/pdf") {
      return "/assets/icons/pdf.svg";
    }
    if (
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "/assets/icons/document.svg";
    }
    return "/assets/icons/file.svg";
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  const removeFile = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className="file-upload">
        <input {...getInputProps()} />
        {files && files?.length > 0 ? (
          <div className="flex flex-col items-center gap-4">
            {isImage(files[0]) ? (
              <Image
                src={getFileIcon(files[0])}
                width={1000}
                height={1000}
                alt="uploaded image"
                className="max-h-[400px] overflow-hidden object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-dark-400 p-4 w-full">
                <Image
                  src={getFileIcon(files[0])}
                  width={40}
                  height={40}
                  alt="file icon"
                  className="h-10 w-10"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {files[0].name}
                  </p>
                  <p className="text-xs text-dark-700">
                    {(files[0].size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="text-sm text-red-500 hover:text-red-600 underline"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <Image
              src="/assets/icons/upload.svg"
              width={40}
              height={40}
              alt="upload"
            />
            <div className="file-upload_label">
              <p className="text-14-regular">
                <span className="text-green-500">Click to upload </span>
                or drag and drop
              </p>
              <p className="text-12-regular">
                Images (PNG, JPG, GIF), PDF, or Word documents (max. 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
