//all products will be shown, there will also be user icon here to link to userInfo
import { FlatList, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MapPin, Search, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { productItem, productJson } from "@/components/interface";
import { API_URL } from "@/components/api";

export default function Home() {
    const[product,setProduct]= useState<productItem[]>([]);
    const[searchKeyword,setSearchKeyword]= useState('');
    const { latitude, longitude } = useLocalSearchParams<{
      latitude?: string;
      longitude?: string;
    }>();

    useEffect(()=>{
            const timer = setTimeout(() => {
              fetchAllProduct(searchKeyword);
            }, 300);

            return () => clearTimeout(timer);
          },[searchKeyword]);
    
      const fetchAllProduct = async(keyword: string) => {
    
        try{
                const response = await fetch(`${API_URL}/getAllProducts`, {
                    method: 'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                      keyword: keyword
                    })
                })
                if (response.ok){
                    const json:productJson = await response.json();
                    console.log("Products :", json.all_product);
                    setProduct(json.all_product)
                }
                else {
                    console.log("Get products failed:", response.status);
                }
            }
            catch(error){console.error('Error posting data:',error);}
      }
    

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TradeHub</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/userInfo")}
        >
          <User size={26} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search size={20} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => router.push("/mapScreen")}
      >
        <MapPin size={20} color="#123f3b" />
        <Text style={styles.locationButtonText}>
          {latitude && longitude
            ? `Location: ${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
            : "Select location"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={product}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
              router.push({
                pathname: "/productDetails",
                params: {
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    detail: item.detail,
                    user: item.user,
                    date: item.date,
                },
                })
            }
          >
            <View style={styles.productImagePlaceholder} />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} baht</Text>
              <Text style={styles.productUser}>Posted by {item.user} on {item.date} </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  searchBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#111",
  },
  locationButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cde6e3",
    backgroundColor: "#e9f8f8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  locationButtonText: {
    flex: 1,
    color: "#123f3b",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
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
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: "#e6e6e6",
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  productUser: {
    fontSize: 13,
    color: "#888",
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 32,
  },
});
