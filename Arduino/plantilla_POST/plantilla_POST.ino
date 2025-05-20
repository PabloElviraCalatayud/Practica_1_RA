#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <base64.h>  // Librería base64 integrada en el core ESP8266

const char* ssid     = "XXXXXXXXXX";//Nombre de la wifi
const char* password = "XXXXXXXXXXXXXXX"; //Contraseña wifi
String serverPath = "http://XXXXXXXXXX:5000/record"; //<IP_SERVIDOR_NODE.js>:<PUERTO>/<Lugar en el que hacer el POST>


void setup() {
  Serial.begin(115200);
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
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // JSON original
    String jsonData = "{\"id_nodo\":\"nodoPrueba4\",\"temperatura\":53.7,\"humedad\":8,\"co2\":0.1,\"volatiles\":911}";

    // Codificamos a Base64
    String jsonBase64 = base64::encode((const uint8_t*)jsonData.c_str(), jsonData.length());
    
    // Preparamos la carga POST con el campo "data" que contendrá el JSON codificado
    String payload = "{\"data\":\"" + jsonBase64 + "\"}";

    http.begin(client, serverPath.c_str());
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Respuesta servidor:");
      Serial.println(response);
    } else {
      Serial.print("Error en la petición: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi no conectado");
  }

  delay(2000);  // Espera n segundos antes de enviar otra vez
}
