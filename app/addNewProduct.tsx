import { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { productAddItem } from "@/components/interface";
import {format} from "date-fns"
import { useAppContext } from "./_layout";
import { router } from "expo-router";
import { API_URL } from "@/components/api";

export default function AddNewProductScreen() {
    const {loggedUsername} =useAppContext();
    const [name,setName]= useState('');
    const [price,setPrice]= useState('');
    const [detail,setDetail]= useState('');
    const [showConfirmPost,setShowConfirmPost]= useState(false);
    const [requiredFields,setRequiredFields]= useState({
        name: false,
        price: false,
        detail: false,
    });

    const handlePostPress = () => {
        const nextRequiredFields = {
            name: name.trim() === '',
            price: price.trim() === '',
            detail: detail.trim() === '',
        };

        setRequiredFields(nextRequiredFields);

        if (
            nextRequiredFields.name ||
            nextRequiredFields.price ||
            nextRequiredFields.detail
        ) {
            return;
        }

        setShowConfirmPost(true);
    }

    const handleAddProduct = async() => {
        setShowConfirmPost(false);
        const today = new Date();
        const product:productAddItem={
                name: name.trim(),
                price: price.trim(),
                date: format(today,'dd-MM-yyyy'),
                detail: detail.trim(),
                user: loggedUsername
            }
        try{
                const response = await fetch(`${API_URL}/addProduct`, {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify(product)
                    })
                if (response.ok){
                    setName('')
                    setPrice('')
                    setDetail('')
                    setRequiredFields({
                        name: false,
                        price: false,
                        detail: false,
                    });
                    router.dismissTo({
                      pathname: '/userInfo',
                      params: { productAdded: 'true' },
                    });
                }
            }
        catch(error){console.error('Error posting data:',error);}
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
            <Text style={styles.confirmTitle}>Post Product</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to post this product?
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
                <Text style={styles.confirmPostText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Add New Product</Text>

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

      <TouchableOpacity style={styles.button} onPress={handlePostPress}>
        <Text style={styles.buttonText}>Post Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 6,
  },
  requiredText: {
    color: "#c62828",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: "#555",
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
    color: "#555",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmPostButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmPostText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
