

package main

import (
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

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
var angularApp string = "/home/aladdin/seedbox42/public/"
//ou port := 2424

//creation compte utilisateur
func registerUser(w http.ResponseWriter, r *http.Request) {
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

	//connexion a la BDD
	session, _ := mgo.Dial("localhost")
	defer session.Close()
	//on definit avec quelle db et table on veut interagir 
	c := session.DB("seedbox").C("user")
	//on y met la structure cree auparavant
	c.Insert(&d)
	io.WriteString(w, d.Json)
}

//connexion utilisateur
func connectUser(w http.ResponseWriter, r *http.Request) {
	//recuperation du contenu de la requete en json
	body, _ := ioutil.ReadAll(r.Body)
	//conversion du json en structure User
	json.Unmarshal(body, &user)
	
	//connexion a la BDD
	session, _ := mgo.Dial("localhost")
	defer session.Close()
	//on definit avec quelle db et table on veut interagir 
	c := session.DB("seedbox").C("user")
	result := Data{}
	//On cherche dans la db un unique resultat pour l'username donne 
	if err := c.Find(bson.M{"username":user.Username}).One(&result); err != nil {
		io.WriteString(w, "Identifiant inconnu")
	} else {
		//On verifie si le mdp est correct en comparant avec le mdp encrypte recupere en base
		if err = bcrypt.CompareHashAndPassword([]byte(result.Password), []byte(user.Password)); err == nil {
			io.WriteString(w, result.Json)
		} else {
			io.WriteString(w, "Incorrect Password")
		}
	}
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
	r.HandleFunc("/signin", registerUser).Methods("POST")
	r.HandleFunc("/login", connectUser).Methods("POST")
	r.HandleFunc("/user/{id:[0-9]*}", updateUser).Methods("PUT")
	r.HandleFunc("/user/{id:[0-9]*}", deleteUser).Methods("DELETE")
	// r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./public/"))))
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(angularApp))))
	http.Handle("/", r)
	//creation du server sur le port 8080
	// http.ListenAndServe(":8080", r)
	http.ListenAndServe(port, r)
}
