import { LoginFailResponseJson, LoginSuccessResponseJson } from "@/components/interface";
import React, { useState } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet} from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useAppContext } from "./_layout";
import { API_URL } from "@/components/api";
import { AppPalette } from "@/constants/theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {loggedUsername, setLoggedUsername} =useAppContext();
  const [errorMessage, setErrorMessage] =useState('');

  const handleLogin = async() => {
    try{
        const response = await fetch(`${API_URL}/login`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        if (response.ok){
            const json:LoginSuccessResponseJson = await response.json();
            setLoggedUsername(username)
            setErrorMessage('')
            router.replace('/home');
        }
        else{ 
            const json:LoginFailResponseJson = await response.json();
            setErrorMessage(json.message)
        }
    }   
    catch(error){
        console.log('Error Finding Login Information')
    }
    
  };
  const handleSignUp = async() => {
    try{
        const response = await fetch(`${API_URL}/signUp`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        if (response.ok){
            const json:LoginSuccessResponseJson = await response.json();
            setLoggedUsername(username)
            setErrorMessage('')
            router.replace('/home');
        }
        else{ 
            const json:LoginFailResponseJson = await response.json();
            setErrorMessage(json.message)
        }
    }   
    catch(error){
        console.log('Error Finding Login Information')
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>TradeHub</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <Text style={styles.text}>or</Text>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <ThemedText style={{color: AppPalette.danger}}> {errorMessage} </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppPalette.background,
    padding: 20,
  },
  loginBox: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: AppPalette.card,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: AppPalette.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: AppPalette.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: AppPalette.card,
    color: AppPalette.textDark,
  },
  button: {
    backgroundColor: AppPalette.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    color: AppPalette.textBody
  }
});
