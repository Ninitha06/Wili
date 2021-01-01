import React from 'react';
import {Text,View,FlatList,TextInput,TouchableOpacity,StyleSheet} from 'react-native';
import db from '../config';


export default class SearchScreen extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            allTransactions : [],
            lastVisibleTransaction : null,
            search : ''
        }
    }

    componentDidMount = async ()=>{
        const query = await db.collection("transaction").get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions : [],
                lastVisibleTransaction : doc
            })
        })
    }
    render(){
        return(
            <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput style={styles.bar} placeholder = "Enter a student id or book id" onChangeText={(text)=>{this.setState({search : text})}}>
                </TextInput>
                <TouchableOpacity style={styles.searchButton} onPress={()=>{
                    this.searchTransaction(this.state.search)}}>
                    <Text>Search</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={this.state.allTransactions} 
                renderItem = {({item})=>(
                       <View style={{bottomBorderWidth : 2, margin :'8%'}}>
                           <Text>{"Book id "+ item.bookId}</Text>
                           <Text>{"Student Id " + item.studentId}</Text>
                           <Text>{"Transaction Type " + item.transactionType}</Text>
                           <Text>{"Date : " + item.date.toDate()}</Text>
                       </View>
                )}
                keyExtractor = {(item,index)=>index.toString()}
                onEndReached = {()=>{this.fetchMoreTransactions}}
                onEndReachedThresold = {0.7}></FlatList>
            </View>   
        );
    }

    fetchMoreTransactions = async ()=>{
        var text = this.state.search.toUpperCase();
        var enteredText = text.split('');

        if(enteredText[0].toUpperCase() === "S"){
            const query = await db.collection("transaction").where("studentId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc
                })
            })
        }
        else if(enteredText[0].toUpperCase() === "B"){
            const query = await db.collection("transaction").where("bookId","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
            query.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc
                })
            })
        }
    }

    searchTransaction = async (text)=>{
        var enteredText = text.split('');
        text = text.toUpperCase();
        if(enteredText[0].toUpperCase() === "S"){
            const query = await db.collection("transaction").where("studentId","==",text).get();
            query.docs.map((doc)=>{
                console.log(doc);
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc
                })
            })
        }
        else if(enteredText[0].toUpperCase() === "B"){
            const query = await db.collection("transaction").where("bookId","==",text).get();
            query.docs.map((doc)=>{
                console.log(doc.data());
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc
                })
                console.log(this.state.allTransactions);
            })
        }
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop : 20
    },
    searchBar : {
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
      marginTop : 30
    },
    bar:{
        borderWidth:2,
        height:30,
        width:300,
        paddingLeft:10,
      },
      searchButton:{
        borderWidth:1,
        height:30,
        width:50,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'green'
      }
  });