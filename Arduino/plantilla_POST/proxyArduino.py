import serial
import json
import requests

SERIAL_PORT = 'COM6'
BAUD_RATE = 9600

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"Conectado al puerto {SERIAL_PORT}")
    except Exception as e:
        print(f"No se pudo abrir el puerto {SERIAL_PORT}: {e}")
        return

    while True:
        try:
            line = ser.readline().decode().strip()
            if not line:
                continue

            print("\nRecibido del ESP8266:", line)

            msg = json.loads(line)
            url = msg["url"]
            data_base64 = msg["data"]

            # ✅ Enviar directamente el Base64 como JSON
            payload = {"data": data_base64}
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, json=payload, headers=headers)

            print("Respuesta del servidor:", response.text)

            

        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    main()
