import json
import time
import pika
import requests
import os
from datetime import datetime, timezone
from dotenv import load_dotenv


# Carrega variáveis do .env
load_dotenv("../.env")

# Detecta automaticamente se está no Docker
# Se o host 'rabbitmq' existir, use ele. Senão, use localhost.
def detect_rabbitmq_host():
    try:
        import socket
        socket.gethostbyname("rabbitmq")
        return "rabbitmq"   # Estamos no Docker
    except Exception:
        return "localhost"  # Estamos rodando localmente

RABBITMQ_HOST = detect_rabbitmq_host()

QUEUE_NAME = os.getenv("QUEUE_NAME", "weather_queue")
LAT = float(os.getenv("LAT", -22.9068))
LON = float(os.getenv("LON", -43.1729))
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL", 3600))

API_URL = (
    f"https://api.open-meteo.com/v1/forecast"
    f"?latitude={LAT}&longitude={LON}"
    f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
)

def connect_rabbitmq():
    credentials = pika.PlainCredentials(
        os.getenv("RABBITMQ_USER", "admin"),
        os.getenv("RABBITMQ_PASS", "admin")
    )

    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    credentials=credentials
                )
            )
            return connection
        except Exception as e:
            print(f"Aguardando RabbitMQ subir ({RABBITMQ_HOST})...", e)
            time.sleep(5)


def fetch_weather():
    response = requests.get(API_URL)
    data = response.json()

    current = data["current"]

    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "location": {"lat": LAT, "lon": LON},
    }

    return payload

def main():
    connection = connect_rabbitmq()
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME)

    print("Iniciando coleta de dados meteorológicos...")

    while True:
        try:
            weather_data = fetch_weather()
            message = json.dumps(weather_data)
            channel.basic_publish(exchange="", routing_key=QUEUE_NAME, body=message)

            print("Enviado para RabbitMQ:", message)
        except Exception as e:
            print("Erro ao coletar/enviar dados:", e)

        time.sleep(FETCH_INTERVAL)

if __name__ == "__main__":
    main()
