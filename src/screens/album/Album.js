import * as UI from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';

import { useUploadMutation } from '../../redux/apiServices/uploadApi';

const ImagePickerComponent = ({ navigation }) => {
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [upload, { data, error, isLoading }] = useUploadMutation();
    const [selectedImages, setSelectedImages] = useState([]);
  
    useEffect(() => {
      requestPermission();
    }, []);

    const requestPermission = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access media library was denied');
        }
      }
    };

    const pickMultipleImages = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          allowsMultipleSelection: true,
          selectionLimit: 5,
          quality: 1,
        });

        // CHECK THE SIZE OF THE IMAGES ARE BELOW 5MB
        const sum = result.assets?.reduce((total, item) => total + item.fileSize, 0);
        let fileSizeMB = sum / (1024 ** 2);

        if (fileSizeMB > 5) {
          alert(`Total image size can not exceed 5MB`);
          return
        }
        // CHECK THE SIZE OF THE IMAGES ARE BELOW 5MB

        if (!result.canceled && result.assets) {

          const selectedImageURIs = result.assets.map((asset) => asset.uri);
          setSelectedImages((prevImages) => [...prevImages, ...selectedImageURIs]);
        }
      } catch (error) {
        console.error('Error picking images:', error.message);
      }
    };

    const uploadImages = async () => {
      if (selectedImages.length === 0) return alert(`Please select images to upload`);  
      
        try {
            const formData = new FormData();
        
            for (let i = 0; i < selectedImages.length; i++) {
              formData.append(`image`, {
                    uri: selectedImages[i],
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                });
            }
          const { data } = await upload(formData);

          setConfirmationMessage(data?.message);
          setSelectedImages([]);
        } catch (error) {
            console.error(error);
        }
    };

    const removeImage = (i) => setSelectedImages((img) => img.filter((_, index) => index !== i));
  
    return (
      <UI.SafeAreaView>
        <UI.Button title="Pick Images" onPress={pickMultipleImages} />
        <UI.Button title="Upload Images" onPress={uploadImages} />
        <UI.Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
        {!isLoading ? 
            <UI.View style={styles.dislpayLayout}>
                {selectedImages.map((uri, index) => (
                    <UI.TouchableOpacity key={index} onPress={() => removeImage(index)}>
                        <UI.View style={{ position: 'relative' }}>
                            <UI.Image source={{ uri }} style={styles.images} />
                            <UI.TouchableOpacity
                                onPress={() => removeImage(index)}
                                style={styles.deleteBtn}>
                                <UI.Text style={styles.deleteText}>X</UI.Text>
                            </UI.TouchableOpacity>
                        </UI.View>
                    </UI.TouchableOpacity>
                ))}
              {confirmationMessage && (
                <UI.View style={styles.upload}>
                  <UI.Text>{confirmationMessage}</UI.Text>
                </UI.View>
              )}
            </UI.View>
            :
              <UI.View style={styles.upload}>
                <UI.ActivityIndicator size="large" color="rgba(0, 0, 0, .6)" />
                <UI.Text>Uploading Images...</UI.Text>
              </UI.View>
          }
      </UI.SafeAreaView>
    );
  };
  
  export default ImagePickerComponent;
  
  const styles = UI.StyleSheet.create({
    dislpayLayout: { 
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    upload: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '75%'
    },
    deleteText: {
        color: 'white', 
        fontSize: 10, 
        fontWeight: 'bold'
      },
      deleteBtn: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'absolute', 
        top: 3, 
        right: 3, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        width: 20, 
        height: 20, 
        borderRadius: '50%' 
    },
      images: { 
        width: 175, 
        height: 175, 
        margin: 5, 
        borderWidth: 3, 
        borderRadius: 5, 
        borderColor: 'rgba(0, 0, 0, .4)' 
    }
  });
