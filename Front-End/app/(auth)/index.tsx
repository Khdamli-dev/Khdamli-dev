import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import Icoon from 'react-native-vector-icons/AntDesign';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import apiClient from '@/api/appClient';
import { getSocket, connectSocket } from '@/api/socket';

export default function Login() {
  const router = useRouter();

  const [focusedInput, setFocusedInput] = useState<string | null>(null); // Track focused input
  const [passwordFocusedInput, setPasswordFocusedInput] = useState<
    string | null
  >(null); // Track focused input
  const [showPassword, setShowPassword] = useState(false);

  // Data
  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid Email').required('Email Is Required'),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*#.?&_-]).{8,64}$/,
        'Password must be 8-64 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character',
      )
      .required('Password Is Required'),
  });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (values: { email: string; password: string }) => {
    setError('');
    setEmailError('');
    setPasswordError('');
    try {
      const response = await apiClient.post(`/auth/login`, values);
      if (response.data.success) {
        const user: any = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        // store tokens to expo-secure-store storage
        const {
          accessToken,
          refreshToken,
        }: { accessToken: string; refreshToken: string } = response.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('email', values.email);
        await SecureStore.setItemAsync('password', values.password);

        // Connect socket and join user room
        try {
          console.log('Connecting to socket...');
          const socket = connectSocket();

          // Wait a brief moment to ensure connection is established
          setTimeout(() => {
            if (socket.connected) {
              console.log(`Joining room for user ${user.id}`);
              socket.emit('user-room', user.id);
            } else {
              console.warn('Socket not connected yet, cannot join room');
              // Retry joining room
              socket.on('connect', () => {
                console.log(
                  `Socket connected, now joining room for user ${user.id}`,
                );
                socket.emit('user-room', user.id);
              });
            }
          }, 500);
        } catch (socketError) {
          console.error('Socket connection error:', socketError);
        }

        // go to home page
        router.replace('/(tabs)/(home)');
      }
    } catch (error: any) {
      if (error.response?.status === 403 && error.response.data) {
        setEmailError(
          !error.response.data.validEmail ? "User don't exist" : '',
        );
        if (error.response.data.validEmail) {
          if (error.response.data.validPassword === false)
            setPasswordError('Password is wrong');
          if (error.response.data.validAccount === false)
            setError(
              'your account is not valid, you need to confirm your email',
            );
        }
      } else {
        console.log(error);
        setError('Server is busy, please try again later');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 min-h-screen bg-specialGreen ">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className=""
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Main Login Section */}
          <View className="bg-specialGreen flex-1 items-center px-4 ">
            {/* Image */}

            <View className="relative w-11/12 h-72 top-12 mb-6">
              <Image
                source={require('../../assets/images/bgLogologin.jpg')}
                className="absolute w-full h-full   "
              />
              <Image
                source={require('../../assets/images/photo_2025-02-04_10-16-04.jpg')}
                className="absolute top-6 left-4 w-11/12 h-52 rounded-full"
              />
            </View>

            <View className="flex-row w-10/12 mt-1 items-baseline justify-center ">
              <Text className="text-9xl text-shadow-custom tracking-tight text-foncyYellow uppercase font-bold ">
                KH
              </Text>
              <Text
                style={{
                  textShadowColor: '#fffff',
                  textShadowOffset: { width: 8, height: 1 },
                  textShadowRadius: 10,
                }}
                className="text-7xl tracking-widest text-bl lowercase font-bold"
              >
                damli
              </Text>
            </View>
            <Text
              style={{
                textShadowColor: '#fffff',
                textShadowOffset: { width: 5, height: 3 },
                textShadowRadius: 5,
              }}
              className="text-4xl font-medium text-white mb-10 text-shadow-sm shadow-red-500"
            >
              Home Services App
            </Text>
          </View>
          {/* Form */}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              handleLogin(values);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldTouched,
              values,
              errors,
              touched,
            }) => (
              <View className="w-full items-center ">
                <View className="relative w-10/12 h-20 my-2 self-center ">
                  {focusedInput !== 'email' && (
                    <Icoon
                      name="user"
                      color="#C4C4C4"
                      size={30}
                      className="absolute left-14 top-6  text-2xl font-bold "
                    />
                  )}

                  <TextInput
                    className={`${
                      focusedInput === 'email' ? 'px-10' : 'pl-28'
                    } w-full h-full text-white text-2xl font-medium border-2 ${emailError || (errors.email && touched.email) ? 'border-red-600' : 'border-white'} rounded-full py-2 `}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onFocus={() => {
                      setFocusedInput('email');
                      setEmailError('');
                      setFieldTouched('email', false);
                      setError('');
                    }}
                    onBlur={() => {
                      if (values.email === '') {
                        setFocusedInput(null);
                      }
                      handleBlur('email');
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Email "
                    placeholderTextColor="#C4C4C4"
                  />
                </View>

                {touched.email && errors.email && (
                  <Text className="text-center text-red-600 text-lg  w-9/12">
                    {errors.email}
                  </Text>
                )}
                {emailError ? (
                  <Text className="text-center text-red-600 text-lg  w-9/12 ">
                    {emailError}
                  </Text>
                ) : null}

                <View className="relative w-10/12 h-20 my-2 self-center ">
                  {passwordFocusedInput !== 'password' && (
                    <Icon
                      name="locked"
                      color="#C4C4C4"
                      size={28}
                      className="absolute left-16 top-6  text-2xl font-bold "
                    />
                  )}

                  <TextInput
                    className={`${
                      passwordFocusedInput === 'password' ? 'pl-10' : 'pl-28'
                    } w-full h-full pr-14 text-white text-2xl font-medium border-2 ${passwordError || (errors.password && touched.password) ? 'border-red-600' : 'border-white'} rounded-full py-2 `}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onFocus={() => {
                      setPasswordFocusedInput('password');
                      setPasswordError('');
                      setFieldTouched('password', false);
                    }}
                    onBlur={() => {
                      if (values.password === '') {
                        setPasswordFocusedInput(null);
                      }
                      handleBlur('password');
                    }}
                    secureTextEntry={!showPassword}
                    placeholder="Password"
                    placeholderTextColor="#C4C4C4"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/4"
                  >
                    <MaterialCommunityIcons
                      name="eye"
                      color={showPassword ? '#fff' : '#BED2D0'}
                      size={35}
                    />
                  </TouchableOpacity>
                </View>

                {touched.password && errors.password && (
                  <Text className="text-center text-red-600 text-lg  w-9/12">
                    {errors.password}
                  </Text>
                )}
                {passwordError ? (
                  <Text className="text-center text-red-600 text-lg  w-9/12 ">
                    {passwordError}
                  </Text>
                ) : null}
                {/* Errors */}
                {error ? (
                  <Text className="text-center text-red-600 text-lg  w-9/12 ">
                    {error}
                  </Text>
                ) : null}

                {/* buttons */}
                <View className=" bg-white p-3 w-full items-center rounded-tl-[50px] mt-10  rounded-tr-[50px] shadow-xl">
                  {/* Forgot Password */}
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/(RestorAccount)')}
                  >
                    <Text className="text-specialGreen mb-6 text-lg font-bold">
                      Forgot Password ?
                    </Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleSubmit as any}
                    className="bg-specialGreen p-6 rounded-full w-11/12 max-w-sm  shadow-xl shadow-black"
                  >
                    <Text className="text-white text-center font-bold text-2xl">
                      Login
                    </Text>
                  </TouchableOpacity>

                  {/*Or */}

                  <Text className="mx-2 my-2 text-specialGreen text-3xl font-bold">
                    or
                  </Text>

                  {/* Sign Up Button  */}

                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/(signUp)')}
                    className="bg-specialGray p-6 rounded-full w-11/12 max-w-sm shadow-md shadow-black mb-8"
                  >
                    <Text className="text-foncyGreen text-center font-medium text-3xl">
                      Create an account
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
