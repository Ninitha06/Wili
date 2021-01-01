import React from 'react';
import {TextInput,View,Text,TouchableOpacity,KeyboardAvoidingView,Image,StyleSheet, Alert} from 'react-native';
import * as firebase from 'firebase';



export default class LoginScreen extends React.Component{

    constructor(){
        super();
        this.state = {
            emailId : null,
            password : null
        }
    }

    login = async(emailId,password)=>{
        if(emailId && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(emailId, password);
                if(response){
                    this.props.navigation.navigate("Transaction");
                }
            }
            catch(error){
                switch(error.code){
                    case "auth/user-not-found":
                        Alert("User not found");
                        console.log("User not found");
                        break;

                    case "auth/invalid-email":
                        Alert("Invalid email");
                        console.log("Invalid email");

                }
            }
        }
        else{
            Alert("Enter EmailId and Password");
            console.log("Enter email id and password");
        }
    }


    
    
    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems:'center',marginTop:20}}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View>
            <TextInput
              style={styles.loginBox}
              placeholder="abc@example.com"
              keyboardType ='email-address'
              onChangeText={(text)=>{
                this.setState({
                  emailId: text
                })
              }}
            />
    
            <TextInput
              style={styles.loginBox}
              secureTextEntry = {true}
              placeholder="enter Password"
              onChangeText={(text)=>{
                this.setState({
                  password: text
                })
              }}
            />
            </View>
            <View>
              <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}}
              onPress={()=>{this.login(this.state.emailId ,this.state.password)}}>
                <Text style={{textAlign:'center'}}>Login</Text>
              </TouchableOpacity>
    
            </View>
          </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    },
    loginButton : {
        width : 90,
        height : 30,
        marginTop : 20,
        paddingTop : 5,
        borderWidth : 1,
        marginLeft : 10,
        borderRadius : 10
    }
  })