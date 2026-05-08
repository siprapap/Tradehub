import { router, useLocalSearchParams } from "expo-router";
import { Plus, Trash2, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppContext } from "./_layout";
import { productJson, productItem } from "@/components/interface";
import { API_URL } from "@/components/api";


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
      const response = await fetch(`${API_URL}/deletePorduct`, {
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
          <Text style={styles.popupText}>New Product Added</Text>
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
          <User size={52} color="#111" />
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
          <Plus size={20} color="#fff" />
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
            <View style={styles.productImagePlaceholder} />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDescription}>{item.detail}</Text>
              <Text style={styles.productPrice}>{item.price} baht</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteProduct(item._id)}
            >
              <Trash2 size={20} color="#c62828" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    borderColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  username: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  logoutButton: {
    backgroundColor: "#e9f8f8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#123f3b",
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
    color: "#111",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },
  productList: {
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffebee",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#123f3b",
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 32,
  },
  popup: {
    backgroundColor: "#123f3b",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: "center",
  },
  popupText: {
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
  confirmDeleteButton: {
    backgroundColor: "#c62828",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmDeleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
