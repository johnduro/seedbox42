

package main

import (
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"

	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"time"
)

//
type Data struct {
	Date     time.Time
	Json     string
	Username string
	Password string
	Group    int
}

type User struct {
	Username string
	Password string
	Mail     string
	Group    int
}

var user User

var port string = ":8080"
var angularApp string = ""
//ou port := 2424

//creation compte utilisateur
func registerUser(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "Inscritpion...")
	//recuperation du contenu de la requete en json
	body, _ := ioutil.ReadAll(r.Body)
	//conversion du json en structure User
	json.Unmarshal(body, &user)
	//encryptage du mot de passe
	pwd, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	//on supprime le mot de passe en clair de notre structure
	user.Password = ""
	//on remet en json pour pouvoir l'integrer dans Data qui ira en base
	body, _ = json.Marshal(user)
	//on remplit la structure qui va etre ingerer dans la BDD
	d := Data{
		Date:     time.Now(),
		Json:     string(body),
		Username: user.Username,
		Password: string(pwd),
		Group:    user.Group,
	}
	//on met en base le nouvel utilisateur
	//TO BE DONE
	io.WriteString(w, d.Json)
}

//connexion utilisateur
func connectUser(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "Connexion...")
	//TO BE DONE
}

//mise a jour des infos d'un utilisateur
func updateUser(w http.ResponseWriter, r *http.Request) {
	//recuperation des infos contenu dans le lien de la requete (wwww.machin.com?key=value&key2=value2&...)
	vars := mux.Vars(r)
	io.WriteString(w, vars["id"])
	//recuperation du contenu de la requete en json
	body, _ := ioutil.ReadAll(r.Body)
	//conversion du json en structure User
	json.Unmarshal(body, &user)
	//encryptage du mot de passe
	pwd, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	//on supprime le mot de passe en clair de notre structure
	user.Password = ""
	//on remet en json pour pouvoir l'integrer dans Data qui ira en base
	body, _ = json.Marshal(user)
	//on remplit la structure qui va etre ingerer dans la BDD
	d := Data{
		Date:     time.Now(),
		Json:     string(body),
		Username: user.Username,
		Password: string(pwd),
		Group:    user.Group,
	}
	//on met a jour les infos de l'utilisateur
	//TO BE DONE
	io.WriteString(w, d.Json)
}

//supprimer un utilisateur
func deleteUser(w http.ResponseWriter, r *http.Request) {
	//recuperation des infos contenu dans le lien de la requete (wwww.machin.com?key=value&key2=value2&...)
	vars := mux.Vars(r)
	io.WriteString(w, "Delete: "+vars["id"])
}

func main() {
	//creation du router
	r := mux.NewRouter()
	//gestion des chemins et leur methodes
	r.HandleFunc("/user", registerUser).Methods("POST")
	r.HandleFunc("/user", connectUser).Methods("GET")
	r.HandleFunc("/user/{id:[0-9]*}", updateUser).Methods("PUT")
	r.HandleFunc("/user/{id:[0-9]*}", deleteUser).Methods("DELETE")
	// r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./public/"))))
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(angularApp))))
	http.Handle("/", r)
	//creation du server sur le port 8080
	// http.ListenAndServe(":8080", r)
	http.ListenAndServe(port, r)
}
