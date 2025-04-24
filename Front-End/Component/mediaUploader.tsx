import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Define the MediaItem type
export interface MediaItem {
  uri: string;
  type: "image" | "video" | "livePhoto" | "pairedVideo";
}

interface MediaUploaderProps {
  onMediaSelect: (media: MediaItem[]) => void;
  maxMedia: number; // Maximum media count passed from parent
  isOpen: boolean; // Flag to trigger opening the picker
  onClose: () => void; // Callback to notify parent that picker is closed
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelect,
  maxMedia,
  isOpen,
  onClose,
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  const pickMedia = async () => {
    if (media.length >= maxMedia) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: maxMedia, // allows selection up to maxMedia (we restrict later)
      quality: 1,
    });

   

    if (!result.canceled) {
      let newMedia: MediaItem[] = result.assets.map((item) => ({
        uri: item.uri,
        type:
          (item.type as "image" | "video" | "livePhoto" | "pairedVideo") ||
          "image",
      }));

      const updatedMedia = [...media, ...newMedia].slice(0, maxMedia);
      setMedia(updatedMedia);
      onMediaSelect(updatedMedia);
    }
    // Notify parent to close the picker flag
    onClose();
  };

  // When isOpen changes to true, trigger the picker.
  useEffect(() => {
    if (isOpen) {
      pickMedia();
    }
  }, [isOpen]);

  const removeMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    setMedia(updatedMedia);
    onMediaSelect(updatedMedia);
  };

  return (
    <View className="w-full px-2 my-2">
      

      {/* Display selected media as small boxes */}
      <ScrollView horizontal >
        {media.map((item, index) => (
          <View key={index} className="relative mr-2">
            {item.type === "image" ||
            item.type === "livePhoto" ||
            item.type === "pairedVideo" ? (
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: 64,
                  height: 64,
                  borderWidth: 2,
                  borderColor: "black",
                  borderRadius: 8,
                }}
                className="w-16 h-16 border-2 rounded-lg"
              />
            ) : (
              <View className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                <MaterialCommunityIcons name="video" size={25} color="black" />
              </View>
            )}

            <TouchableOpacity
              onPress={() => removeMedia(index)}
              className="absolute right-0 bg-red rounded-full p-1"
            >
              <MaterialCommunityIcons name="close" size={16} color="black" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MediaUploader;
