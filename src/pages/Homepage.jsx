import React, { useState, useRef } from 'react';
import axios from "axios";

const ImageBackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKey, setApiKey] = useState('iB7Ra2A2zwHez1afYgyC5qDs');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setErrorMessage('');
    setProcessedImage(null);
    setErrorMessage('');
    setProcessedImage(null);
    
    if (!file.type.match('image.*')) {
      setErrorMessage('Please select an image file (PNG, JPG, JPEG, etc.)');
      return;
    }
    if (!file.type.match('image.*')) {
      setErrorMessage('Please select an image file (PNG, JPG, JPEG, etc.)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      if (apiKey) {
        removeBackground(file);
      } else {
        setShowApiKeyInput(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeBackground = async (file) => {
    setIsProcessing(true);
  
    try {
      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_file", file);
  
      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      });
  
      const base64 = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
  
      setProcessedImage(`data:image/png;base64,${base64}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.title || `${error.response?.status}: ${error.response?.statusText}`;
      setErrorMessage(`Error removing background: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim() && originalImage) {
      const file = fileInputRef.current.files[0];
      if (file) {
        removeBackground(file);
      }
      setShowApiKeyInput(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'removed-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 text-purple-600">BGone</h1>
        <h3 className="text-2xl font-bold mb-2 text-purple-400">Image Background Remover</h3>
        <p className="text-gray-400">Upload an image to remove its background using remove.bg API</p>
      </div>

      {showApiKeyInput && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="text-lg font-medium mb-2 text-purple-300">Enter remove.bg API Key</h4>
          <p className="text-sm text-gray-400 mb-4">You need an API key from remove.bg to process images</p>
          <form onSubmit={handleApiKeySubmit} className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-purple-500 bg-gray-800' : 'border-gray-600 hover:border-purple-400 bg-gray-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-12 h-12 text-purple-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-300">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>


      {errorMessage && (
        <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 mb-6" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}


      {originalImage && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <h2 className="text-lg font-semibold mb-2 text-purple-300">Original Image</h2>
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <img src={originalImage} alt="Original" className="max-w-full h-auto mx-auto" />
              </div>
            </div>

            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <h2 className="text-lg font-semibold mb-2 text-purple-300">Processed Image</h2>
              <div className="bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '200px' }}>
                {isProcessing ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-400">Removing background...</p>
                  </div>
                ) : processedImage ? (
                  <div className="bg-dark-checkered rounded-lg overflow-hidden w-full h-full">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                ) : (
                  <p className="text-gray-400">
                    {apiKey ? "Processing will appear here" : "Enter API key to process image"}
                  </p>
                )}
              </div>
            </div>
          </div>


          {processedImage && !isProcessing && (
            <div className="mt-6 text-center">
              <button
                onClick={downloadImage}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      )}      
    </div>
  );
};
export default ImageBackgroundRemover;