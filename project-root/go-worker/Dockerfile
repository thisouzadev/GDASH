FROM golang:1.23 AS build

WORKDIR /src

COPY . .

RUN go build -o /go-worker .
