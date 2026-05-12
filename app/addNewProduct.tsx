import { useEffect, useState } from "react";
import { Modal, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { productAddItem } from "@/components/interface";
import {format} from "date-fns"
import { useAppContext } from "./_layout";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "@/components/api";
import { AppPalette } from "@/constants/theme";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { ChevronDown, MapPin } from "lucide-react-native";

export default function AddNewProductScreen() {
    const {loggedUsername, defaultLocation, setDefaultLocation} =useAppContext();
    const {
      latitude,
      longitude,
      locationName,
      productId,
      name: initialName,
      price: initialPrice,
      detail: initialDetail,
      category: initialCategory,
      contactDetails: initialContactDetails,
      imageUri: initialImageUri,
    } = useLocalSearchParams<{
      latitude?: string;
      longitude?: string;
      locationName?: string;
      productId?: string;
      name?: string;
      price?: string;
      detail?: string;
      category?: string;
      contactDetails?: string;
      imageUri?: string;
    }>();
    const isEditing = !!productId;
    const [name,setName]= useState(initialName || '');
    const [price,setPrice]= useState(initialPrice || '');
    const [detail,setDetail]= useState(initialDetail || '');
    const [category, setCategory] = useState(initialCategory || '');
    const [contactDetails, setContactDetails] = useState(initialContactDetails || '');
    const [imageUri, setImageUri] = useState(initialImageUri || '');
    const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
    const [showConfirmPost,setShowConfirmPost]= useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [requiredFields,setRequiredFields]= useState({
        name: false,
        price: false,
        detail: false,
        category: false,
        contactDetails: false,
        location: false,
    });

    useEffect(() => {
      if (defaultLocation) {
        setSelectedLocation(defaultLocation);
      }
    }, [defaultLocation]);

    useEffect(() => {
      if (isEditing && latitude && longitude) {
        setSelectedLocation({
          latitude,
          longitude,
          locationName: locationName || `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
        });
        return;
      }

      if (!isEditing && defaultLocation) {
        setSelectedLocation(defaultLocation);
      }
    }, [defaultLocation, isEditing, latitude, longitude, locationName]);

    useEffect(() => {
      if (latitude && longitude) {
        const nextLocation = {
          latitude,
          longitude,
          locationName: locationName || `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
        };
        setSelectedLocation(nextLocation);
        setDefaultLocation(nextLocation);
        setRequiredFields((current) => ({
          ...current,
          location: false,
        }));
      }
    }, [latitude, longitude, locationName, setDefaultLocation]);

    const handlePostPress = () => {
        const nextRequiredFields = {
            name: name.trim() === '',
            price: price.trim() === '',
            detail: detail.trim() === '',
            category: category.trim() === '',
            contactDetails: contactDetails.trim() === '',
            location: !selectedLocation,
        };

        setRequiredFields(nextRequiredFields);

        if (
            nextRequiredFields.name ||
            nextRequiredFields.price ||
            nextRequiredFields.detail ||
            nextRequiredFields.category ||
            nextRequiredFields.contactDetails ||
            nextRequiredFields.location
        ) {
            return;
        }

        setShowConfirmPost(true);
    }

    const resetForm = () => {
      setName('')
      setPrice('')
      setDetail('')
      setCategory('')
      setContactDetails('')
      setImageUri('')
      setRequiredFields({
          name: false,
          price: false,
          detail: false,
          category: false,
          contactDetails: false,
          location: false,
      });
    }

    const handleAddProduct = async() => {
        setShowConfirmPost(false);
        const today = new Date();
        const product:productAddItem={
                productId,
                name: name.trim(),
                price: price.trim(),
                date: format(today,'dd-MM-yyyy'),
                detail: detail.trim(),
                user: loggedUsername,
                category: category.trim(),
                contactDetails: contactDetails.trim(),
                imageUri,
                locationName: selectedLocation?.locationName || '',
                latitude: selectedLocation?.latitude || '',
                longitude: selectedLocation?.longitude || '',
            }
        try{
                const response = await fetch(`${API_URL}/${isEditing ? 'updateProduct' : 'addProduct'}`, {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(product)
                    })
                if (response.ok){
                    resetForm();
                    router.dismissTo({
                      pathname: '/userInfo',
                      params: { productAdded: 'true' },
                    });
                }
            }
        catch(error){console.error('Error posting data:',error);}
    }

    const handlePickImage = async() => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
          base64: true,
        });

        if (result.canceled) {
          return;
        }

        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          setImageUri(`data:${mimeType};base64,${asset.base64}`);
          return;
        }

        if (asset.uri) {
          setImageUri(asset.uri);
        }
      }
      catch(error) {
        console.error("Error picking image:", error);
      }
    }
  return (
    <View style={styles.container}>
      <Modal
        visible={showConfirmPost}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmPost(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>{isEditing ? "Save Changes" : "Post Product"}</Text>
            <Text style={styles.confirmText}>
              {isEditing
                ? "Are you sure you want to update this product?"
                : "Are you sure you want to post this product?"}
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmPost(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmPostButton}
                onPress={handleAddProduct}
              >
                <Text style={styles.confirmPostText}>{isEditing ? "Save" : "Post"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalBox}>
            <Text style={styles.confirmTitle}>Select Category</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PRODUCT_CATEGORIES.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.categoryOption}
                  onPress={() => {
                    setCategory(option);
                    setRequiredFields((current) => ({
                      ...current,
                      category: false,
                    }));
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>{isEditing ? "Edit Product" : "Add New Product"}</Text>

      <TextInput style={styles.input} 
        placeholder="Product name" 
        value={name}
        onChangeText={(text:string)=>{
                    setName(text)
                    setRequiredFields((current) => ({
                        ...current,
                        name: false,
                    }))
                }}
        />
      {requiredFields.name && <Text style={styles.requiredText}>Required</Text>}

      <TextInput style={styles.input} 
        placeholder="Price" 
        keyboardType="numeric" 
        value={price}
        onChangeText={(text:string)=>{
                    setPrice(text)
                    setRequiredFields((current) => ({
                        ...current,
                        price: false,
                    }))
                }}
      />
      {requiredFields.price && <Text style={styles.requiredText}>Required</Text>}

      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <Text style={category ? styles.selectorValue : styles.selectorPlaceholder}>
          {category || "Select category"}
        </Text>
        <ChevronDown size={18} color={AppPalette.textBody} />
      </TouchableOpacity>
      {requiredFields.category && <Text style={styles.requiredText}>Required</Text>}

      <TextInput
        style={styles.input}
        placeholder="Contact details"
        value={contactDetails}
        onChangeText={(text:string)=>{
                    setContactDetails(text)
                    setRequiredFields((current) => ({
                        ...current,
                        contactDetails: false,
                    }))
                }}
      />
      {requiredFields.contactDetails && <Text style={styles.requiredText}>Required</Text>}

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        multiline
        value={detail}
        onChangeText={(text:string)=>{
                    setDetail(text)
                    setRequiredFields((current) => ({
                        ...current,
                        detail: false,
                    }))
                }}
      />
      {requiredFields.detail && <Text style={styles.requiredText}>Required</Text>}

      <TouchableOpacity style={styles.locationButton} onPress={() => router.push({
        pathname: "/mapScreen",
        params: {
          source: "post",
          productId,
          name,
          price,
          detail,
          category,
          contactDetails,
          imageUri,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
          locationName: selectedLocation?.locationName,
        },
      })}>
        <MapPin size={20} color={AppPalette.primary} />
        <Text style={styles.locationButtonText}>
          {selectedLocation ? `Location: ${selectedLocation.locationName}` : "Select location"}
        </Text>
      </TouchableOpacity>
      {requiredFields.location && <Text style={styles.requiredText}>Required</Text>}

      <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
        <Text style={styles.imageButtonText}>
          {imageUri ? "Change product image" : "Upload product image"}
        </Text>
      </TouchableOpacity>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No image selected</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handlePostPress}>
        <Text style={styles.buttonText}>{isEditing ? "Save Changes" : "Post Product"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppPalette.background,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: AppPalette.primary,
    marginBottom: 24,
  },
  input: {
    backgroundColor: AppPalette.card,
    borderWidth: 1,
    borderColor: AppPalette.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 6,
    color: AppPalette.textDark,
  },
  requiredText: {
    color: AppPalette.danger,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  locationButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppPalette.border,
    paddingHorizontal: 14,
    backgroundColor: AppPalette.card,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  selectorButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppPalette.border,
    paddingHorizontal: 14,
    backgroundColor: AppPalette.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  selectorPlaceholder: {
    color: AppPalette.muted,
    fontSize: 16,
  },
  selectorValue: {
    color: AppPalette.textDark,
    fontSize: 16,
  },
  locationButtonText: {
    marginLeft: 10,
    color: AppPalette.textBody,
    fontSize: 16,
    fontWeight: "700",
  },
  imageButton: {
    backgroundColor: AppPalette.card,
    borderWidth: 1,
    borderColor: AppPalette.border,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  imageButtonText: {
    color: AppPalette.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: AppPalette.placeholder,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    backgroundColor: AppPalette.placeholder,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: AppPalette.textBody,
    fontSize: 15,
  },
  button: {
    backgroundColor: AppPalette.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppPalette.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 20,
  },
  categoryModalBox: {
    width: "100%",
    maxWidth: 360,
    maxHeight: 520,
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 20,
  },
  categoryOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppPalette.border,
  },
  categoryOptionText: {
    color: AppPalette.textDark,
    fontSize: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: AppPalette.textBody,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: AppPalette.textBody,
    fontSize: 16,
    fontWeight: "700",
  },
  confirmPostButton: {
    backgroundColor: AppPalette.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmPostText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
  },
});
