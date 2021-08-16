import React from 'react';
import {Text,View,StyleSheet,TouchableOpacity,TextInput,Image,Alert,KeyboardAvoidingView,ToastAndroid} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      scanned: false,
      hasPermissions: null,
      buttonState: "normal",
      scannedBookId: "",
      scannedStudentId: "",
      transactionMessage: "",
    };
  }

    componentDidMount() {
      
        // didBlur in old react navigation
    this._unsubscribe = this.props.navigation.addListener("didBlur", () => {
      console.log("Am getting called");
      this.setState({
        buttonState: "normal",
      });
    });
  }

  componentWillUnmount() {
   // this._unsubscribe();
      this._unsubscribe.remove();  // Old react navigation
  }
  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasPermissions: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    if (this.state.buttonState === "BookId") {
      this.setState({
        scanned: true,
        scannedBookId: data,
        buttonState: "normal",
      });
    } else if (this.state.buttonState === "StudentId") {
      this.setState({
        scanned: true,
        scannedStudentId: data,
        buttonState: "normal",
      });
    }
  };

  initiateBookIssue = async () => {
    /// console.log(firebase.firestore.Timestamp.now().toDate());

    db.collection("transaction").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    });

    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: false,
    });

    db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        booksIssued: firebase.firestore.FieldValue.increment(1),
      });

    //  Alert.alert("Book Issued");

    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };

  initiateBookReturn = async () => {
    console.log("No error");
    db.collection("transaction").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    });

    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });

    db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        booksIssued: firebase.firestore.FieldValue.increment(-1),
      });

    //  Alert.alert("Book Returned");

    this.setState({
      scannedBookId: "",
      scannedStudentId: "",
    });
  };

  handleTransaction = async () => {
    var transactionType = await this.checkBookEligibility();
    if (!transactionType) {
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
      Alert.alert("Book id not in our database");
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentforIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        ToastAndroid.show("Book issued to Student", ToastAndroid.SHORT);
      }
    } else {
      var isStudentEligible = await this.checkStudentforReturn();
      if (isStudentEligible) {
        this.initiateBookReturn();

        ToastAndroid.show("Book returned to library", ToastAndroid.SHORT);
      }
    }
  };

  checkBookEligibility = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookId", "==", this.state.scannedBookId)
      .get();

    var transactionType = "";
    if (bookRef.docs.length == 0) {
      transactionType = "false";
    } else {
      bookRef.docs.map((doc) => {
        var book = doc.data();
        console.log(book);
        if (book.bookAvailability) {
          transactionType = "Issue";
        } else {
          transactionType = "Return";
        }
      });
    }
    console.log("Book eligibility complete");
    return transactionType;
  };

  checkStudentforIssue = async () => {
    const studentRef = await db
      .collection("students")
      .where("studentId", "==", this.state.scannedStudentId)
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      isStudentEligible = "false";
      Alert.alert("Student ID not in database");
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.booksIssued < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            scannedBookId: "",
            scannedStudentId: "",
          });
          Alert.alert("Student already has 2 books issued");
        }
      });
    }
    return isStudentEligible;
  };

  checkStudentforReturn = async () => {
    var transactionRef = await db
      .collection('transaction')
      .where('bookId', '==', this.state.scannedBookId)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
    console.log(transactionRef);
    var isStudentEligible = "";
    if (transactionRef.docs.length == 0) {
      isStudentEligible = false;
      this.setState({
        scannedBookId: "",
        scannedStudentId: "",
      });
      Alert.alert("The Book is not issued yet");
    } else {
      transactionRef.docs.map((doc) => {
        var transaction = doc.data();
        if (transaction.studentId == this.state.scannedStudentId) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          this.setState({
            scannedBookId: "",
            scannedStudentId: "",
          });
          Alert.alert("Book is not issued to this Student");
        }
      });
    }
    return isStudentEligible;
  };

  render() {
    const hasCameraPermission = this.state.hasPermissions;
    if (this.state.buttonState !== "normal" && hasCameraPermission) {
      return (
        <BarCodeScanner
          onBarCodeScanned={
            this.state.scanned ? undefined : this.handleBarCodeScanned
          }
          style={StyleSheet.absoluteFillObject}
        ></BarCodeScanner>
      );
    } else if (this.state.buttonState === "normal") {
      return (
        <KeyboardAvoidingView style={styles.container}>
          <Image
            source={require("../assets/booklogo.jpg")}
            style={{ height: 200, width: 200 }}
          ></Image>
          <Text style={{ fontSize: 30, textAlign: "center" }}>Wily</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              onChangeText={(text) => this.setState({ scannedBookId: text })}
              placeholder="Book ID"
              value={this.state.scannedBookId}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("BookId");
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Student ID"
              onChangeText={(text) => this.setState({ scannedStudentId: text })}
              value={this.state.scannedStudentId}
            ></TextInput>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermissions("StudentId");
              }}
            >
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={this.handleTransaction}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
    scanButton : {
        backgroundColor : 'blue',
        margin : 10,
        padding : 10
    },
    buttonText : {
        textDecorationLine : 'underline',
        fontSize : 15,
        color : 'white'
    },
    displayText : {
        fontSize : 12,
    },

    inputView : {
        flex : 1, justifyContent : 'center', alignItems : 'center'
    },

    inputText : {
        width:350 ,
        height : 40,
        borderWidth : 1.5,
        fontSize : 15,
    },
    container : {
        flex : 1,
        alignContent : 'center',
        alignItems :'center' 
    },

    submitText : {
        fontSize : 20,
        textAlign : 'center',
        fontWeight : 'bold',
        color : 'white'
    },

    submitButton : {
        backgroundColor : 'blue',
        width : 100,
        height : 30
    }

});
