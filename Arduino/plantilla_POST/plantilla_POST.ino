#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <AESLib.h>
#include <base64.h>

const char* ssid = "1111";
const char* password = "12345678";

AESLib aesLib;

// Clave AES-128 (16 bytes)
byte aes_key[] = {
  0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF,
  0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF
};

// IV (16 bytes) – debe ser el mismo en el servidor
byte aes_iv[] = {
  0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90,
  0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78, 0x90
};

// Cifra el mensaje usando AES-128 CBC con PKCS#7 y lo devuelve en Base64
String encryptToBase64(String msg) {
  const int blockSize = 16;
  int msgLen = msg.length();               // longitud sin el '\0'
  int padLen = blockSize - (msgLen % blockSize);  // bytes de padding
  int totalLen = msgLen + padLen;

  byte input[totalLen];

  // Copiar datos del mensaje
  for (int i = 0; i < msgLen; i++) {
    input[i] = msg[i];
  }

  // Añadir padding PKCS#7
  for (int i = msgLen; i < totalLen; i++) {
    input[i] = padLen;
  }

  byte encrypted[totalLen + blockSize]; // margen extra
  byte iv_copy[sizeof(aes_iv)];
  memcpy(iv_copy,aes_iv,sizeof(aes_iv));
  int encLen = aesLib.encrypt(input, totalLen, encrypted, aes_key, sizeof(aes_key), iv_copy);

  return base64::encode(encrypted, encLen);
}

void setup() {
  Serial.begin(9600);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Conectado. IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  String jsonData = "{\"id_nodo\":\"nodoPrueba4\",\"temperatura\":53.7,\"humedad\":8,\"co2\":0.1,\"volatiles\":911}";

  // Cifrar y codificar
  String encryptedBase64 = encryptToBase64(jsonData);

  // Montar mensaje JSON para enviar por Serial
  String mensaje = "{\"url\":\"http://10.100.0.101:5000/record\",\"data\":\"" + encryptedBase64 + "\"}";
  Serial.println(mensaje);

  // Leer posible respuesta
  if (Serial.available()) {
    String respuesta = Serial.readStringUntil('\n');
    Serial.println("Respuesta del servidor:");
    Serial.println(respuesta);
  }

  delay(5000);  // Esperar 5 segundos antes de repetir
}