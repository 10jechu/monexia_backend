import requests

BASE_URL = "http://127.0.0.1:8000"
TOKEN = ""

def test_step(name, func):
    print(f"--- Probando: {name} ---")
    try:
        func()
        print("✅ PASÓ\n")
    except Exception as e:
        # Esto nos dirá exactamente por qué falla (si es 401, 422, etc.)
        if hasattr(e, 'response') and e.response is not None:
            print(f"❌ FALLÓ: {e.response.status_code} - {e.response.text}\n")
        else:
            print(f"❌ FALLÓ: {e}\n")

# 1. Login para obtener Token
def login():
    global TOKEN
    # USAMOS LOS DATOS DE LICETH
    payload = {"username": "liceth@correo.com", "password": "252610"} 
    response = requests.post(f"{BASE_URL}/auth/token", data=payload)
    response.raise_for_status()
    TOKEN = response.json()["access_token"]
    print(f"Token obtenido: {TOKEN[:15]}...")

# 2. Probar Perfil de Usuario
def get_profile():
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(f"{BASE_URL}/usuarios/me", headers=headers)
    response.raise_for_status()
    print(f"Usuario: {response.json()['nombre']} ({response.json()['rol']})")

# 3. Crear un Ingreso
def create_income():
    headers = {"Authorization": f"Bearer {TOKEN}"}
    # Asegúrate de que los campos coincidan con tu UsuarioSchema de Ingreso
    payload = {
        "descripcion": "Sueldo Diciembre", 
        "monto": 3000.0,
        "categoria": "Salario" # Añadido por si tu esquema lo requiere
    }
    response = requests.post(f"{BASE_URL}/ingresos/", json=payload, headers=headers)
    response.raise_for_status()

# 4. Crear un Gasto Fijo
def create_expense():
    headers = {"Authorization": f"Bearer {TOKEN}"}
    payload = {
        "nombre": "Arriendo", # <--- Cambia 'descripcion' por 'nombre'
        "monto": 1200.0, 
        "categoria": "Vivienda"
    }
    response = requests.post(f"{BASE_URL}/gastos/", json=payload, headers=headers)
    response.raise_for_status()

# 5. Ver el Dashboard Consolidado
def get_dashboard():
    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.get(f"{BASE_URL}/dashboard/consolidado", headers=headers)
    response.raise_for_status()
    data = response.json()
    # Ajustado a los campos que pusimos en el router de dashboard
    print(f"Resumen: {data.get('mensaje', 'Sin mensaje')}")
    print(f"Balance: {data.get('balance', 0)}")

if __name__ == "__main__":
    test_step("Autenticación", login)
    test_step("Perfil de Usuario", get_profile)
    test_step("Crear Ingreso", create_income)
    test_step("Crear Gasto Fijo", create_expense)
    test_step("Dashboard Final", get_dashboard)