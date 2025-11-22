package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Timestamp   string      `json:"timestamp"`
	Temperature float64     `json:"temperature"`
	Humidity    float64     `json:"humidity"`
	WindSpeed   float64     `json:"wind_speed"`
	Location    interface{} `json:"location"`
}

func main() {
	// Carrega variáveis do .env
	err := godotenv.Load("../.env")
	if err != nil {
		log.Println("Aviso: não foi possível carregar .env, usando variáveis de ambiente do sistema")
	}

	rabbitUser := os.Getenv("RABBITMQ_USER")
	rabbitPass := os.Getenv("RABBITMQ_PASS")
	rabbitHost := os.Getenv("RABBITMQ_HOST")
	queueName := os.Getenv("RABBITMQ_QUEUE")
	apiURL := os.Getenv("API_URL")

	if apiURL == "" {
		log.Fatal("API_URL não definida no .env do worker")
	}

	// Conecta no RabbitMQ
	connStr := fmt.Sprintf("amqp://%s:%s@%s:5672/", rabbitUser, rabbitPass, rabbitHost)
	conn, err := amqp.Dial(connStr)
	if err != nil {
		log.Fatalf("Erro ao conectar no RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Erro ao abrir canal: %v", err)
	}

	// Garante que a fila existe
	_, err = ch.QueueDeclare(
		queueName,
		false, // durable=false
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		log.Fatalf("Erro ao declarar fila: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",
		false, // auto-ack desabilitado
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Erro ao consumir mensagens: %v", err)
	}

	log.Println("Go Worker aguardando mensagens...")

	forever := make(chan bool)

	go func() {
		for msg := range msgs {
			log.Printf("Mensagem recebida: %s\n", string(msg.Body))

			var data WeatherData
			err := json.Unmarshal(msg.Body, &data)
			if err != nil {
				log.Println("Erro ao validar JSON:", err)
				msg.Nack(false, false) // descarta mensagem inválida
				continue
			}

			// Envia para API NestJS com retry
			err = sendToAPIWithRetry(apiURL, data, 3)
			if err != nil {
				log.Println("Erro ao enviar para API após retries:", err)
				msg.Nack(false, true) // coloca de volta na fila
				continue
			}

			msg.Ack(false)
			log.Println("✔ Mensagem processada com sucesso.")
		}
	}()

	<-forever
}

func sendToAPIWithRetry(apiURL string, data WeatherData, maxRetries int) error {
	for i := 0; i < maxRetries; i++ {
		err := sendToAPI(apiURL, data)
		if err == nil {
			return nil
		}

		log.Printf("Erro ao enviar para API, retry %d/%d: %v", i+1, maxRetries, err)
		time.Sleep(2 * time.Second)
	}
	return fmt.Errorf("falha ao enviar para API após %d tentativas", maxRetries)
}

func sendToAPI(apiURL string, data WeatherData) error {
	jsonBody, err := json.Marshal(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("API retornou erro HTTP %d", resp.StatusCode)
	}

	return nil
}
