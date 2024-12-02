from flask import Flask, request, jsonify
import pypdf2htmlEX
import os
import shutil

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True, port=4000)
