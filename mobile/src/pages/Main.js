import React,{useEffect,useState} from 'react'
import {StyleSheet,Image, View, Text,TextInput,TouchableOpacity,Keyboard} from 'react-native'
import MapView,{Marker,Callout} from 'react-native-maps'
import {requestPermissionsAsync,getCurrentPositionAsync} from 'expo-location'
import {MaterialIcons} from '@expo/vector-icons' 

import api from '../services/api'
import {connect,disconnect,subscribeToNewDevs} from  '../services/socket'

function Main({navigation}){
    const [currentRegion, setCurrentRegion] = useState(null)
    const [devs,setDevs] = useState([])
    const [techs,setTechs] = useState('')
    
    useEffect(()=>{
        async function loadInitialPosition(){
            const {granted} = await requestPermissionsAsync()
            if(granted){
                const {coords} = await getCurrentPositionAsync({
                    enableHighAccuracy:true,
                })

                const {latitude,longitude} = coords

                setCurrentRegion({
                    latitude,longitude,
                    latitudeDelta: 0.006,longitudeDelta:0.006
                })
            }
        }
        loadInitialPosition()
    },[])

    useEffect(()=>{subscribeToNewDevs(dev=>setDevs([...devs,dev]))},[devs])
    if(!currentRegion){return null}

    function setupWebsocket(){
        disconnect()
        const {latitude,longitude} = currentRegion
        connect(
            latitude,longitude,techs
        )
    }
    async function loadDevs(){
        const {latitude,longitude} = currentRegion

        const response = await api.get('/search',{
            params:{
                latitude,longitude,techs
            }
        })

        setDevs(response.data.devs)
        setupWebsocket()
    }

    function handleRegionChange(region){
        setCurrentRegion(region)        
    }

    return (
        <>
        <MapView
          onRegionChangeComplete={handleRegionChange}
          initialRegion={currentRegion} 
          style={styles.map}
        >         
            {devs.map(dev=>(
                <Marker 
                    key={dev._id}
                    coordinate={{
                        latitude:dev.location.coordinates[1],
                        longitude:dev.location.coordinates[0]}}>
                    <Image  style={styles.avatar} source={{uri:dev.avatar_url}}/>
                    <Callout onPress={()=>{
                        navigation.navigate('Profile',{github_username:dev.github_username});
                    }}>
                        <View style={styles.callout}>
                            <Text style={styles.devName}>{dev.name}}</Text>
                            <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
                            <Text style={styles.devBio}>{dev.bio}</Text>                        
                        </View>
                    </Callout>
                </Marker> 
            ))}
        </MapView>
        <View style={styles.searchForm}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar devs"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              value={techs}
              onChangeText={setTechs}
            />
            <TouchableOpacity  onPress={loadDevs}style={styles.searchButton}>
                <MaterialIcons name="my-location" size ={16}color="#fff"/>
            </TouchableOpacity>   
        </View>
        </>
    )
}

export default Main

const styles = StyleSheet.create({
    map:{
        flex:1
    },
    avatar:{
        width:48,
        height:48,
        borderRadius:30,
        borderWidth:2,
        borderColor:'#666'
    },
    callout:{
        width:180,        
    },
    devName:{
        fontWeight:'bold',
        fontSize:14
    },
    devBio:{
        fontSize:8,
        color:'#666',
    },
    devTechs:{
        marginTop:2,
    },
    searchForm:{
        position:'absolute',
        bottom:20,
        left:20,
        right:20,
        zIndex:5,
        flexDirection:"row"
    },
    searchInput:{
        flex:1,
        height:50,
        backgroundColor:"#fff",
        color:"#333",
        borderRadius:25,
        paddingHorizontal: 20,
        fontSize:16,
        shadowColor:'#000',
        shadowOpacity:0.2,
        shadowOffset:{
            width:4,
            height:4
        },
        elevation:3,
    },
    searchButton:{
        width:50,
        height:50,
        backgroundColor:"#8e4dff",
        borderRadius:25,
        justifyContent:"center",
        alignItems:'center',
        marginLeft:10,
        shadowColor:'#000',
        shadowOpacity:0.2,
        shadowOffset:{
            width:4,
            height:4
        },
        elevation:3,
    }
})