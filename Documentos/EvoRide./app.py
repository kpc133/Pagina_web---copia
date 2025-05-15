from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import sqlite3
import os
from werkzeug.utils import secure_filename
import secrets
import time
from datetime import datetime, timedelta
import qrcode

app = Flask(__name__)
app.secret_key = 'clave_secreta'


# Texto o URL que quieres codificar en el QR
contenido = "https://tu-enlace-o-texto-aqui.com/"

# Crear el código QR
qr = qrcode.QRCode(
    version=1,  # Controla el tamaño del código QR
    error_correction=qrcode.constants.ERROR_CORRECT_L,  
    box_size=10,  # Tamaño de cada cuadro del código QR
    border=4  # Bordes alrededor del QR
)

qr.add_data(contenido)
qr.make(fit=True)

# Crear la imagen del QR
imagen = qr.make_image(fill="black", back_color="white") 

# Guardar la imagen
imagen.save("static/coqr/codigo_qr.png")

print("¡Código QR generado y guardado como 'codigo_qr.png'!")



# Crear la base de datos si no existe
def crear_db():
    if not os.path.exists('db'):
        os.makedirs('db')
    conn = sqlite3.connect('db/usuarios.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            email TEXT UNIQUE,
            contraseña TEXT,
            fecha_registro DATETIME
            foto_perfil TEXT DEFAULT 'default.png'
        )
    ''')
    conn.commit()
    conn.close()

crear_db()

codigo_actual = None
timestamp_generacion = None
TIEMPO_EXPIRACION = 5 * 60  # 5 minutos en segundos

def generar_codigo():
    return secrets.token_urlsafe(16)

@app.route('/api/obtener_codigo')
def obtener_codigo():
    global codigo_actual
    global timestamp_generacion

    ahora = time.time()

    if timestamp_generacion is None or ahora - timestamp_generacion > TIEMPO_EXPIRACION:
        codigo_actual = generar_codigo()
        timestamp_generacion = ahora

    tiempo_restante = int(TIEMPO_EXPIRACION - (ahora - timestamp_generacion))
    if tiempo_restante < 0:
        tiempo_restante = 0

    return jsonify({'codigo': codigo_actual, 'tiempo_restante': tiempo_restante})

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    nombre = data['nombre']
    email = data['email']
    contraseña = data['contraseña']

    try:
        conn = sqlite3.connect('db/usuarios.db')
        c = conn.cursor()
        c.execute("INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)", (nombre, email, contraseña))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'El correo ya está registrado'})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data['email']
    contraseña = data['contraseña']

    conn = sqlite3.connect('db/usuarios.db')
    cursor = conn.cursor()
    cursor.execute("SELECT nombre FROM usuarios WHERE email = ? AND contraseña = ?", (email, contraseña))
    user = cursor.fetchone()
    conn.close()

    if user:
        session['usuario'] = email
        session['nombre'] = user[0]
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Credenciales incorrectas'})

@app.route('/welcome')
def welcome():
    if 'usuario' in session:
        return render_template('welcome.html', nombre=session['nombre'])
    else:
        return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if 'usuario' in session:
        return render_template('dashboard.html', nombre=session['nombre'])
    else:
        return redirect(url_for('home'))
    
@app.route('/index-re')
def mostrar_index_re():
    return render_template('index-re.html')

@app.route('/user')
def mostrar_user():
    return render_template('user.html')

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB limit

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def upload_form():
    return render_template('upload_form.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'pdf_file' not in request.files:
        return render_template('upload_form.html', message='No se seleccionó ningún archivo', status='error')
    file = request.files['pdf_file']
    if file.filename == '':
        return render_template('upload_form.html', message='No se seleccionó ningún archivo', status='error')
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            return render_template('upload_form.html', message='Archivo subido exitosamente', status='success')
        except Exception as e:
            return render_template('upload_form.html', message=f'Error al guardar el archivo: {e}', status='error')
    else:
        return render_template('upload_form.html', message='Tipo de archivo no permitido. Solo se permiten archivos PDF.', status='error')

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('usuario', None)
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return redirect(url_for('index'))

@app.route('/')
def index():
    if 'usuario' in session:
        return f"¡Hola, {session['usuario']}! <br> <form method='POST' action='{url_for('logout')}'><button type='submit' class='close-sesion'><i class='fa-solid fa-right-from-bracket'></i> Cerrar Sesión</button></form>"
    else:
        return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)