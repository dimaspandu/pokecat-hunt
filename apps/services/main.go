package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Cat struct {
	Name    string `json:"name"`
	IconUrl string `json:"iconUrl"`
	Rarity  string `json:"rarity"`
}

var client *mongo.Client

func init() {
	var err error
	client, err = mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("MongoDB connection failed:", err)
	}
	fmt.Println("Connected to MongoDB")
}

func getAllCats() ([]Cat, error) {
	catsCollection := client.Database("pokecat_hunt").Collection("cats")
	var cats []Cat
	cursor, err := catsCollection.Find(context.Background(), bson.D{{}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var cat Cat
		if err := cursor.Decode(&cat); err != nil {
			return nil, err
		}
		cats = append(cats, cat)
	}
	return cats, nil
}

func getCats(w http.ResponseWriter, r *http.Request) {
	cats, err := getAllCats()
	if err != nil {
		http.Error(w, "Error fetching cats data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cats)
}

type CreateCatRequest struct {
	Name    string `json:"name"`
	Rarity  string `json:"rarity"`
	IconUrl string `json:"iconUrl"` // URL returned from storage upload
}

func createCat(w http.ResponseWriter, r *http.Request) {
	// Parse JSON from frontend (after storage upload)
	var reqData CreateCatRequest
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if reqData.Name == "" || reqData.Rarity == "" || reqData.IconUrl == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	newCat := Cat{
		Name:    reqData.Name,
		Rarity:  reqData.Rarity,
		IconUrl: reqData.IconUrl,
	}

	catsCollection := client.Database("pokecat_hunt").Collection("cats")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := catsCollection.InsertOne(ctx, newCat)
	if err != nil {
		http.Error(w, "Failed to insert cat", http.StatusInternalServerError)
		log.Println("MongoDB insert error:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Cat created successfully",
		"id":      res.InsertedID,
		"iconUrl": reqData.IconUrl,
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/api/cats", getCats).Methods("GET")
	r.HandleFunc("/api/cats", createCat).Methods("POST")

	handlerWithCors := corsMiddleware(r)

	fmt.Println("Server running on port 5000...")
	log.Fatal(http.ListenAndServe(":5000", handlerWithCors))
}
