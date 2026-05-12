import { router, useLocalSearchParams } from "expo-router";
import { Pencil, Plus, Trash2, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppContext } from "./_layout";
import { productJson, productItem } from "@/components/interface";
import { API_URL } from "@/components/api";
import { AppPalette } from "@/constants/theme";
import { Image } from "expo-image";


export default function UserInfoScreen() {
  const {loggedUsername, setLoggedUsername} =useAppContext();
  const { productAdded } = useLocalSearchParams<{ productAdded?: string }>();
  const [showProductAdded, setShowProductAdded] = useState(false);
  const[userProduct,setUserProduct]= useState<productItem[]>([]);
  const [productToDelete, setProductToDelete] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (productAdded === "true") {
      setShowProductAdded(true);

      const timer = setTimeout(() => {
        setShowProductAdded(false);
        router.setParams({ productAdded: undefined });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [productAdded]);

  useEffect(()=>{
        fetchUserProduct();
      },[productAdded, loggedUsername]);

  const fetchUserProduct = async() => {
    if (!loggedUsername) {
      setUserProduct([]);
      return;
    }

    try{
            const response = await fetch(`${API_URL}/getUserProducts`, {
                method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    username: loggedUsername
                })
            })
            if (response.ok){
                const json:productJson = await response.json();
                console.log("Products for user:", loggedUsername, json.all_product);
                setUserProduct(json.all_product)
            }
            else {
                console.log("Get products failed:", response.status);
            }
        }
        catch(error){console.error('Error posting data:',error);}
  }

  const handleDeleteProduct = async(productId: string) => {
    try {
      const response = await fetch(`${API_URL}/deleteProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          username: loggedUsername,
        }),
      });

      if (response.ok) {
        await fetchUserProduct();
      }
      else {
        console.log("Delete product failed:", response.status);
      }
    }
    catch(error) {
      console.error("Error deleting product:", error);
    }
  }

  const confirmDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  }

  const handleLogout = () => {
    setLoggedUsername("");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      {showProductAdded && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>Product saved</Text>
        </View>
      )}

      <Modal
        visible={productToDelete !== undefined}
        transparent
        animationType="fade"
        onRequestClose={() => setProductToDelete(undefined)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Product</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this product?
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setProductToDelete(undefined)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={async() => {
                  if (productToDelete) {
                    await handleDeleteProduct(productToDelete);
                    setProductToDelete(undefined);
                  }
                }}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.infoBox}>
        <View style={styles.avatarCircle}>
          <User size={52} color={AppPalette.primary} />
        </View>

        <Text style={styles.username}>{loggedUsername}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productHeader}>
        <Text style={styles.sectionTitle}>Your Products</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/addNewProduct")}
        >
          <Plus size={20} color={AppPalette.card} />
          <Text style={styles.addButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have not posted any products yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.productImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.productImagePlaceholder} />
            )}

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription}>{item.category || "Uncategorized"}</Text>
              <Text style={styles.productDescription}>{item.detail}</Text>
              <Text style={styles.productPrice}>{item.price} baht</Text>
              <Text style={styles.productDescription}>{item.locationName || "No location set"}</Text>
            </View>

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push({
                  pathname: "/addNewProduct",
                  params: {
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    detail: item.detail,
                    category: item.category,
                    contactDetails: item.contactDetails,
                    imageUri: item.imageUri,
                    locationName: item.locationName,
                    latitude: item.latitude,
                    longitude: item.longitude,
                  },
                })}
              >
                <Pencil size={18} color={AppPalette.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDeleteProduct(item._id)}
              >
                <Trash2 size={20} color={AppPalette.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppPalette.background,
    padding: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: AppPalette.card,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: AppPalette.background,
    borderColor: AppPalette.border,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  username: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: AppPalette.textDark,
  },
  logoutButton: {
    backgroundColor: AppPalette.background,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppPalette.textBody,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: AppPalette.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppPalette.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
  },
  addButtonText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  productList: {
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: AppPalette.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: AppPalette.placeholder,
    marginRight: 14,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: AppPalette.placeholder,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppPalette.dangerSoft,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  productActions: {
    marginLeft: 12,
    alignItems: "center",
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AppPalette.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppPalette.border,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: AppPalette.textBody,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: AppPalette.primary,
  },
  emptyText: {
    color: AppPalette.textBody,
    textAlign: "center",
    marginTop: 32,
  },
  popup: {
    backgroundColor: AppPalette.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: "center",
  },
  popupText: {
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
  confirmDeleteButton: {
    backgroundColor: AppPalette.danger,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmDeleteText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
  },
});
