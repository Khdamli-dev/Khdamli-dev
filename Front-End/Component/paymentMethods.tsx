import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import apiClient from '@/api/appClient';
import refreshAccessToken from '@/api/refreshAccessToken';
import { router } from 'expo-router';

interface PaymentMethod {
  name: string;
  id: number;
}

interface PaymentMethodProps {
  selectedPayment: PaymentMethod | null;
  onSelectPayment: (Payment: PaymentMethod) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedPayment,
  onSelectPayment,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await apiClient.get(`/work/payment`);
      if (response.status === 200)
        setPaymentMethods(response.data.paymentMethods);
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (await refreshAccessToken()) {
          await fetchPaymentMethods();
        } else {
          // need to login
          router.push('/(auth)');
        }
      }
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSelect = (Payment: PaymentMethod) => {
    onSelectPayment(Payment);
  };

  return (
    <View className="items-end justify-center w-full ">
      <View className="w-10/12 bg-white border-2 border-specialGreen rounded-xl shadow-xl  pt-2 mt-2">
        <ScrollView
          style={{ maxHeight: 200 }}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {paymentMethods.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              className="py-3 h-14 px-4 border-2 mx-2 border-gray-300 rounded-md mb-2 bg-white justify-center items-center"
              onPress={() => handleSelect(item)}
            >
              <Text className="text-lg font-semibold text-gray-700">
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default PaymentMethod;
