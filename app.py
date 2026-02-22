import sqlite3
from flask import Flask, render_template, request, send_file, jsonify
from rembg import remove, new_session
from PIL import Image
import io
import os
import uuid
from datetime import datetime

# CONFIGURATION FOR HOSTING & ACCURACY
# Set model storage path to project directory (required for Railway/Render)
os.environ["U2NET_HOME"] = os.path.join(os.getcwd(), "models")
os.makedirs(os.environ["U2NET_HOME"], exist_ok=True)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # Increased to 25MB
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ORIGINAL_FOLDER'] = os.path.join(app.config['UPLOAD_FOLDER'], 'originals')
app.config['PROCESSED_FOLDER'] = os.path.join(app.config['UPLOAD_FOLDER'], 'processed')
app.config['DATABASE'] = 'database.db'

# Create folders if they don't exist
os.makedirs(app.config['ORIGINAL_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# LOAD BEST ACCURACY MODEL ONCE (Faster processing)
# We use 'isnet-general-use' for professional results
MODEL_NAME = "isnet-general-use"
print(f"📦 Loading AI Model: {MODEL_NAME}...")
session = new_session(MODEL_NAME)

def init_db():
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS image_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_name TEXT,
            saved_original TEXT,
            saved_processed TEXT,
            timestamp DATETIME
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB
init_db()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(file_stream, unique_id, raw_filename):
    """Core function with enhanced memory optimization for high-res images"""
    extension = raw_filename.rsplit('.', 1)[1].lower()
    original_filename = f"orig_{unique_id}.{extension}"
    processed_filename = f"proc_{unique_id}.png"
    
    original_path = os.path.join(app.config['ORIGINAL_FOLDER'], original_filename)
    processed_path = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)
    
    # Open and Save original
    img = Image.open(file_stream)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(original_path)

    # STABILITY GUARD: Standard resolution for fast & safe processing
    MAX_SIZE = 1000 
    if max(img.size) > MAX_SIZE:
        print(f"⚠️ Resizing to {MAX_SIZE} for system stability")
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
    
    # PROCESS WITH HIGH ACCURACY SETTINGS
    # Re-enabling alpha_matting with optimized thresholds
    # erosion_size: Refines the edges
    # foreground_threshold: Higher values preserve more of the main object (like your orange hoodie)
    output_image = remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=260, # Higher = keep more foreground
        alpha_matting_background_threshold=10,  # Lower = remove more background
        alpha_matting_ero_size=10
    )
    
    output_image.save(processed_path, format='PNG')
    
    # Log to DB
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO image_history (original_name, saved_original, saved_processed, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (raw_filename, original_filename, processed_filename, datetime.now()))
    conn.commit()
    conn.close()
    
    return processed_path, output_image

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    try:
        unique_id = uuid.uuid4().hex[:8]
        processed_path, _ = process_image(file.stream, unique_id, file.filename)
        
        return send_file(
            processed_path,
            mimetype='image/png',
            as_attachment=True,
            download_name=f"bg_removed_{unique_id}.png"
        )
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/preview', methods=['POST'])
def preview_background_removal():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    try:
        import base64
        unique_id = uuid.uuid4().hex[:8]
        _, output_image = process_image(file.stream, unique_id, file.filename)
        
        # Convert to base64
        img_buffer = io.BytesIO()
        output_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}'
        })
    except Exception as e:
        return jsonify({'error': f'Preview failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 PRO AI Background Remover is running!")
    print("✨ Using Model: isnet-general-use (Alpha Matting Active)")
    app.run(debug=True, host='0.0.0.0', port=5000)
