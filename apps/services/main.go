package main

import (
	"context"       // Import context for MongoDB operations
	"encoding/json" // Import encoding/json to handle JSON responses
	"fmt"           // Import fmt for printing
	"log"           // Import log for logging errors
	"net/http"      // Import net/http for HTTP server functionality

	"github.com/gorilla/mux"                    // Import Gorilla Mux for routing HTTP requests
	"go.mongodb.org/mongo-driver/bson"          // Import BSON for MongoDB operations
	"go.mongodb.org/mongo-driver/mongo"         // Import MongoDB client
	"go.mongodb.org/mongo-driver/mongo/options" // Import MongoDB options for configuration
)

// Cat struct represents the structure of a "cat" document in the MongoDB database.
type Cat struct {
	Name    string `json:"name"`    // The name of the cat
	IconUrl string `json:"iconUrl"` // The URL of the cat's image
	Rarity  string `json:"rarity"`  // The rarity of the cat (common, rare, legendary)
}

// MongoDB client to interact with the database
var client *mongo.Client

// init() function initializes the MongoDB client and establishes a connection.
func init() {
	var err error
	// Directly connect to the MongoDB instance using mongo.Connect
	client, err = mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err) // Log and stop execution if there is an error while creating the client
	}

	// Verify the connection to MongoDB
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("MongoDB connection failed:", err)
	}
	fmt.Println("Connected to MongoDB")
}

// getAllCats fetches all "cat" documents from the MongoDB database.
// It returns a slice of Cat structs and any error encountered.
func getAllCats() ([]Cat, error) {
	// Access the "cats" collection in the "pokecat_hunt" database
	catsCollection := client.Database("pokecat_hunt").Collection("cats")

	var cats []Cat // This will hold the list of cats retrieved from the database

	// Perform a find operation to retrieve all documents from the "cats" collection
	cursor, err := catsCollection.Find(context.Background(), bson.D{{}})
	if err != nil {
		log.Fatal(err)  // Log and return error if there is any problem
		return nil, err // Return nil and error
	}
	defer cursor.Close(context.Background()) // Ensure the cursor is closed when done

	// Iterate over the cursor to decode each document into the Cat struct
	for cursor.Next(context.Background()) {
		var cat Cat
		if err := cursor.Decode(&cat); err != nil {
			log.Fatal(err) // Log error if there is any decoding issue
		}
		cats = append(cats, cat) // Append decoded cat to the cats slice
	}

	return cats, nil // Return the cats slice and no error
}

// getCats is the HTTP handler for the /api/cats route.
// It retrieves all the cats from MongoDB and returns them as a JSON response.
func getCats(w http.ResponseWriter, r *http.Request) {
	// Call getAllCats to retrieve the list of cats from MongoDB
	cats, err := getAllCats()
	if err != nil {
		// If an error occurs while fetching the cats, return an error response
		http.Error(w, "Error fetching cats data", http.StatusInternalServerError)
		return
	}

	// Set the response content type to JSON
	w.Header().Set("Content-Type", "application/json")
	// Encode the cats list into JSON and send it as the response
	json.NewEncoder(w).Encode(cats)
}

func main() {
	// Create a new router using Gorilla Mux
	r := mux.NewRouter()
	// Register the /api/cats route with the GET method to the getCats handler
	r.HandleFunc("/api/cats", getCats).Methods("GET")

	// Print message to indicate that the server is running on port 5000
	fmt.Println("Server running on port 5000...")
	// Start the HTTP server and listen for incoming requests on port 5000
	log.Fatal(http.ListenAndServe(":5000", r))
}
