import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, SafeAreaView, ScrollView, KeyboardAvoidingView, Dimensions, TouchableOpacity,
    Alert, Platform
} from 'react-native';



import { useRouter } from "expo-router";










export default function ForgotPassword() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

    const router = useRouter();


    return (

        <SafeAreaView className="flex-1 bg-gray-200">
                
                    <View className="w-full flex-row justify-end items-center px-6 pt-6">
                        <TouchableOpacity onPress={() => router.back()} className="flex-1 w-full flex items-end justify-end">
                            <Text style={{ textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, color: "#F8A100" }} className="text-6xl  font-extrabold">X</Text>
                        </TouchableOpacity>
                    </View>

                <ScrollView contentContainerStyle={{ flexGrow: 1,paddingHorizontal:20 }}>
                    
                    <Text className="text-base font-semibold mb-3">
                        Here are the Terms and Conditions for the "Khdamli" app:
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text className="font-bold" style={{color:"#BD7D06"}}>Acceptance of Terms: </Text>
                        By using the <Text className='font-bold  text-foncyYellow ' >Kh</Text><Text className='font-medium text-sm text-black  '>damli</Text>   app, you agree to comply with these Terms and
                        Conditions. If you do not agree with any part of these terms, please
                        do not use our app.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Description of Service: </Text>
                        The "Khdamli" app allows workers to post their services and personal
                        information, and customers to search for services and browse worker
                        profiles.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Use of the App: </Text>
                        Users must be over the legal age of 18. The app is intended for personal,
                        non-commercial use only, unless otherwise agreed by us for any internal
                        or general purpose.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Accounts and Security: </Text>
                        You are responsible for maintaining the confidentiality of your login
                        credentials and are responsible for any unauthorized activity that
                        occurs through their use.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Privacy: </Text>
                        We respect your privacy. The app may request permissions needed by
                        workers. Any personal information is handled according to our privacy
                        policy.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Payment: </Text>
                        Payment is managed through third parties. The app management has no
                        direct role in the transactions processed by workers or customers.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Liability: </Text>
                        The user is responsible for any usage or content provided by them.
                        "Khdamli" is not liable for damages or losses incurred due to the
                        services or interactions facilitated by the app.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Modifications to the App: </Text>
                        We reserve the right to modify or discontinue, temporarily or
                        permanently, the app (or any part of it) with or without notice.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Termination: </Text>
                        We may terminate or suspend your access to the app immediately,
                        without prior notice or liability, for any reason whatsoever.
                    </Text>

                    <Text className="text-sm leading-5 mb-4">
                        <Text  style={{color:"#BD7D06"}} className="font-bold">Governing Law: </Text>
                        These terms and conditions are governed by the laws of your
                        jurisdiction.
                    </Text>

                    <Text  className="text-sm leading-5">
                    
                    <Text  style={{color:"#BD7D06"}}  className="font-bold">For More Information : </Text> If you have any questions about these terms, you can contact us via email at:
                     <Text className='font-medium'>[khdamliapp@gmail.com]</Text> .
                    Make sure all information accurately reflects the nature of your app and that you consult with a legal professional before officially publishing these terms.
                        
                    </Text>

                </ScrollView>
        </SafeAreaView>
    );
}
