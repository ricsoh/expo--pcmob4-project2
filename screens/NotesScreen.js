import firebase from "../database/firebaseDB";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotesScreen({ navigation, route }) {
  const [docName, setDocName] = useState([]);
  const [notes, setNotes] = useState([]);
  const db = firebase.firestore().collection("todos");

  // Load up Firebase on start.
  // The snapshot keeps everything synced -- no need to do it again!
  // WHen the screen loads, we start monitoring Firebase
  useEffect(() => {
    const unsubcribe = db.onSnapshot((collection) => {
        // this set up a array that store the unique data
        const updatedNotes = collection.docs.map((doc) => doc.data());
        setNotes(updatedNotes);
        // this set up a array that store the unique docName
        const updatedDocName = collection.docs.map((doc) => doc.id);
        setDocName(updatedDocName);
      });
    // Unsubcribe when unmounting
    return unsubcribe; // return the cleanup function
  }, []);

  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.params for changes and add items to the database
  useEffect(() => {
    if (route.params?.text) {
      const newNote = {
        title: route.params.text,
        done: false,
        id: notes.length.toString(),
      };
      db.add(newNote);
//      setNotes([...notes, newNote]); // the listner has this done
    }
  }, [route.params?.text]);

  function addNote() {
    navigation.navigate("Add Screen");
  }

  // This deletes an individual note
  function deleteNote(recID) {

    // delete using unique docName
    db.doc(docName[recID]).delete().then(function() {
      // To delete that item from screen, we filter out the item we don't want
      setNotes(notes.filter((item) => item.id !== recID));
      console.log("Document successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });;
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
//        keyExtractor={(item) => item.id.toString()}
        keyExtractor={(item) => item.id} // This version id is already a string
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});
