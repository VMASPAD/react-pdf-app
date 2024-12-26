from flask import Flask, request, jsonify, send_from_directory
import pypdf2htmlEX
import os
import shutil
from pyppeteer import launch
import nest_asyncio
from playwright.sync_api import sync_playwright
from flask_cors import CORS

nest_asyncio.apply()
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'C:/data/pdf/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/convertHtml', methods=['POST'])
def convert_pdf_to_html():
    file = request.get_json()
    print(file['file'])

    if file and file['file'].endswith('.pdf'):
        # Ruta del archivo PDF de entrada
        pdf_file_path = os.path.join('/mnt/c/data/pdf/', file['file'])

        # Crear una instancia del convertidor y convertir el archivo PDF a HTML
        pdf = pypdf2htmlEX.PDF(pdf_file_path)
        pdf.to_html(dest_dir=pdf_file_path.replace('.pdf', ''))  # Usar el mismo nombre que el PDF, pero como carpeta

        # Ruta del archivo HTML generado
        output_html_path = os.path.join(pdf_file_path.replace('.pdf', ''), file['file'].replace('.pdf', '')+'.html')  # Ajusta el nombre según lo que genere el convertidor

        # Mover el archivo HTML a la carpeta destino
        if os.path.exists(output_html_path):
            shutil.move(output_html_path, '/mnt/c/data/html/' + file['file'].replace('.pdf', '.html'))

        # Eliminar la carpeta generada
        shutil.rmtree(pdf_file_path.replace('.pdf', ''))

        return jsonify({"message": "Conversión completada", "html_path": '/mnt/c/data/html/' + file['file'].replace('.pdf', '.html')}), 200
    else:
        return jsonify({"error": "Invalid file format, only PDFs are allowed"}), 400

def generate_pdf(url, pdf_path):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        page.pdf(path=pdf_path, format='A4')
        browser.close()

@app.route('/convertPdf', methods=['POST'])
def convert_html_to_pdf():
    file = request.get_json()

    if file and file['file'].endswith('.html'):
        html_file_path = os.path.join('/mnt/c/data/html/', file['file'])
        pdf_file_path = os.path.join('/mnt/c/data/pdf/', file['file'].replace('.html', '.pdf'))

        if not os.path.exists(html_file_path):
            return jsonify({"error": "El archivo HTML no existe"}), 404

        try:
            generate_pdf(f'file://{html_file_path}', pdf_file_path)
            return jsonify({"message": "Conversión completada", "pdf_path": pdf_file_path}), 200
        except Exception as e:
            return jsonify({"error": f"Error al convertir: {str(e)}"}), 500
    else:
        return jsonify({"error": "Formato de archivo inválido, solo se permiten archivos HTML"}), 400

@app.route('/previewPdf/<path:filename>')
def serve_file(filename):
    """
    Sirve archivos desde el directorio especificado bajo el prefijo /files.
    """
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Archivo no encontrado"}), 404
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Crea la carpeta si no existe
    print(f"Servidor iniciado. Coloca tus archivos en: {os.path.abspath(UPLOAD_FOLDER)}")
    app.run(debug=True, port=4000)
