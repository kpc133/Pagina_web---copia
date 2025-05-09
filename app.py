from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import sqlite3
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'clave_secreta'

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
        )
    ''')
    conn.commit()
    conn.close()

crear_db()

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
    
    app = Flask(__name__)

#Dirije a la pagina de reserva

@app.route('/index-re')
def mostrar_index_re():
    return render_template('index-re.html')

# otras rutas...
    
#Se encarga del cargue de PDF'S 

    app = Flask(__name__)
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

#Se encarga de cerrar la sesion del usuario

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
        return redirect(url_for('login'))

    
if __name__ == '__main__':
    app.run(debug=True)

