// ==========================================
// AI Background Remover - Frontend Logic
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadSection = document.querySelector('.upload-section');
    const loadingSection = document.getElementById('loadingSection');
    const resultSection = document.getElementById('resultSection');
    const originalImage = document.getElementById('originalImage');
    const processedImage = document.getElementById('processedImage');
    const newImageBtn = document.getElementById('newImageBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentProcessedImageUrl = null;
    let currentFileName = 'bg_removed.png';

    // ==========================================
    // Event Listeners
    // ==========================================

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Button events
    newImageBtn.addEventListener('click', resetToUpload);
    downloadBtn.addEventListener('click', downloadImage);

    // ==========================================
    // File Handling Functions
    // ==========================================

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            processImage(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (isValidImageType(file)) {
                processImage(file);
            } else {
                showError('Invalid file type. Please upload PNG, JPG, JPEG, or WEBP.');
            }
        }
    }

    function isValidImageType(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    // ==========================================
    // Image Processing
    // ==========================================

    async function processImage(file) {
        // Show original image preview
        const originalUrl = URL.createObjectURL(file);
        originalImage.src = originalUrl;
        currentFileName = file.name.replace(/\.[^/.]+$/, '') + '_no_bg.png';

        // Show loading state
        showLoading();

        try {
            const formData = new FormData();
            formData.append('image', file);

            // Call the preview API
            const response = await fetch('/preview', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Show result
                processedImage.src = data.image;
                currentProcessedImageUrl = data.image;
                showResult();
            } else {
                throw new Error(data.error || 'Failed to process image');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'An error occurred while processing the image.');
            resetToUpload();
        }
    }

    // ==========================================
    // UI State Functions
    // ==========================================

    function showLoading() {
        uploadSection.classList.add('hidden');
        resultSection.classList.remove('active');
        loadingSection.classList.add('active');
    }

    function showResult() {
        loadingSection.classList.remove('active');
        uploadSection.classList.add('hidden');
        resultSection.classList.add('active');
    }

    function resetToUpload() {
        loadingSection.classList.remove('active');
        resultSection.classList.remove('active');
        uploadSection.classList.remove('hidden');

        // Reset file input
        fileInput.value = '';

        // Clear images
        originalImage.src = '';
        processedImage.src = '';
        currentProcessedImageUrl = null;
    }

    function showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <span>${message}</span>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #EF4444, #DC2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
            z-index: 1000;
            animation: toastIn 0.3s ease;
        `;

        toast.querySelector('svg').style.cssText = `
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        `;

        document.body.appendChild(toast);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ==========================================
    // Download Function
    // ==========================================

    function downloadImage() {
        if (!currentProcessedImageUrl) {
            showError('No processed image available.');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = currentProcessedImageUrl;
        link.download = currentFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success feedback
        showSuccess('Image downloaded successfully!');
    }

    function showSuccess(message) {
        const toast = document.createElement('div');
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${message}</span>
        `;

        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
            z-index: 1000;
            animation: toastIn 0.3s ease;
        `;

        toast.querySelector('svg').style.cssText = `
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ==========================================
    // Add CSS Animations
    // ==========================================

    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes toastOut {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
});
