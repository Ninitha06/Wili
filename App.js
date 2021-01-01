import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {createAppContainer,createSwitchNavigator} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import { StyleSheet,Image } from 'react-native';

import SearchScreen from './screens/SearchScreen';
import TransactionScreen from './screens/TransactionScreen';
import LoginScreen from './screens/LoginScreen';



export default class App extends React.Component {
  render(){
    return (
      
        <AppContainer />
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


const TabNavigator = createBottomTabNavigator({
  Transaction : {screen : TransactionScreen},
  Search : {screen : SearchScreen}
},
{
  defaultNavigationOptions : ({navigation}) => ({
    tabBarIcon : ({}) => {
      const routeName = navigation.state.routeName;
      if(routeName === 'Transaction'){
        return (
          <Image source = {require('./assets/book.png')} style={{height : 35, width : 35}}/>);
      }
      else if(routeName === 'Search'){
        return (
          <Image source = {require('./assets/searchingbook.png')} style={{height : 35, width : 35}}></Image>
        );
      }
    }
  })
});

const switchNavigator = createSwitchNavigator({
  LoginScreen : {screen : LoginScreen},
  TabNavigator : {screen : TabNavigator}
})

const AppContainer = createAppContainer(switchNavigator);