import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function AddProduct({ route, navigation }) {
  const { shopId } = route.params;
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('Unisex'); // default
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validate = () => {
    let errs = {};
    if (!name) errs.name = 'Product name is required';
    if (!price) errs.price = 'Price is required';
    if (!category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitProduct = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let uploadedImageUrl = null;

      if (imageUri) {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: 'product.jpg',
          type: 'image/jpeg',
        });
        
        const uploadRes = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/upload/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.url;
      }

      const productData = {
        shopId,
        name,
        price: parseFloat(price),
        description,
        category,
        gender,
        image: uploadedImageUrl
      };

      await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/products/add`, productData);
      
      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Manual Header Removed */}

      <View style={styles.form}>
        <TouchableOpacity style={[styles.imagePicker, errors.image && styles.inputError]} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePickerText}>+ Add Product Photo</Text>
          )}
        </TouchableOpacity>

        <TextInput 
          style={[styles.input, errors.name && styles.inputError]} 
          placeholder="Product Name" 
          value={name} 
          onChangeText={(txt) => {
            setName(txt);
            if (errors.name) setErrors({...errors, name: null});
          }} 
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput 
          style={[styles.input, errors.price && styles.inputError]} 
          placeholder="Price (₹)" 
          value={price} 
          onChangeText={(txt) => {
            setPrice(txt);
            if (errors.price) setErrors({...errors, price: null});
          }} 
          keyboardType="numeric" 
        />
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

        <TextInput 
          style={[styles.input, errors.category && styles.inputError]} 
          placeholder="Category (e.g., T-Shirt, Mobile)" 
          value={category} 
          onChangeText={(txt) => {
            setCategory(txt);
            if (errors.category) setErrors({...errors, category: null});
          }} 
        />
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        <TextInput style={styles.input} placeholder="Gender (Men/Women/Kids/Unisex)" value={gender} onChangeText={setGender} />
        <TextInput style={styles.input} placeholder="Description (Optional)" value={description} onChangeText={setDescription} multiline />

        <TouchableOpacity style={styles.button} onPress={submitProduct} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Product</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#1D9E75', padding: 20, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { marginRight: 15 },
  backText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  imagePicker: {
    width: '100%', height: 200, backgroundColor: '#fff', borderWidth: 1,
    borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden'
  },
  image: { width: '100%', height: '100%' },
  imagePickerText: { color: '#1D9E75', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#1D9E75', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5
  }
});
