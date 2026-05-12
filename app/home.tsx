//all products will be shown, there will also be user icon here to link to userInfo
import { FlatList, Modal, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUpDown, MapPin, Search, SlidersHorizontal, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { productItem, productJson } from "@/components/interface";
import { API_URL } from "@/components/api";
import { AppPalette } from "@/constants/theme";
import { Image } from "expo-image";
import { useAppContext } from "./_layout";
import { PRODUCT_CATEGORIES } from "@/constants/categories";

type SortOption = "distance" | "priceLowToHigh" | "priceHighToLow";

type ProductWithDistance = productItem & {
  distanceKm: number;
};

const getDistanceKm = (
  userLatitude: number,
  userLongitude: number,
  productLatitude?: string,
  productLongitude?: string
) => {
  const lat = Number(productLatitude);
  const lng = Number(productLongitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Number.POSITIVE_INFINITY;
  }

  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(lat - userLatitude);
  const longitudeDelta = toRadians(lng - userLongitude);
  const startLatitude = toRadians(userLatitude);
  const endLatitude = toRadians(lat);

  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getPriceValue = (price: string) => {
  const normalized = price.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

export default function Home() {
    const[product,setProduct]= useState<ProductWithDistance[]>([]);
    const[searchKeyword,setSearchKeyword]= useState('');
    const { defaultLocation, setDefaultLocation, locationLoaded } = useAppContext();
    const { latitude, longitude } = useLocalSearchParams<{
      latitude?: string;
      longitude?: string;
    }>();
    const [activeLocation, setActiveLocation] = useState(defaultLocation);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [locationRequestCompleted, setLocationRequestCompleted] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("distance");
    const [showSortModal, setShowSortModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [maxDistanceKm, setMaxDistanceKm] = useState("");

    useEffect(() => {
      setActiveLocation(defaultLocation);
    }, [defaultLocation]);

    useEffect(() => {
      if (!locationLoaded || defaultLocation || locationRequestCompleted) {
        return;
      }

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setShowLocationPrompt(true);
        setLocationRequestCompleted(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
            locationName: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
          };
          setActiveLocation(nextLocation);
          setDefaultLocation(nextLocation);
          setShowLocationPrompt(false);
          setLocationRequestCompleted(true);
        },
        () => {
          setShowLocationPrompt(true);
          setLocationRequestCompleted(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }, [defaultLocation, locationLoaded, locationRequestCompleted, setDefaultLocation]);

    useEffect(() => {
      if (latitude && longitude) {
        const nextLocation = {
          latitude,
          longitude,
          locationName: `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
        };
        setActiveLocation(nextLocation);
        setDefaultLocation(nextLocation);
        setShowLocationPrompt(false);
        setLocationRequestCompleted(true);
      }
    }, [latitude, longitude, setDefaultLocation]);

    useEffect(()=>{
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
                    const productsWithDistance = json.all_product.map((item) => ({
                      ...item,
                      distanceKm: activeLocation
                        ? getDistanceKm(
                            Number(activeLocation.latitude),
                            Number(activeLocation.longitude),
                            item.latitude,
                            item.longitude
                          )
                        : Number.POSITIVE_INFINITY,
                    }));

                    const nextMinPrice = minPrice.trim() ? Number(minPrice) : undefined;
                    const nextMaxPrice = maxPrice.trim() ? Number(maxPrice) : undefined;
                    const nextMaxDistanceKm = maxDistanceKm.trim() ? Number(maxDistanceKm) : undefined;

                    const filteredProducts = productsWithDistance.filter((item) => {
                      const priceValue = getPriceValue(item.price);
                      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
                      const matchesMinPrice = nextMinPrice === undefined || priceValue >= nextMinPrice;
                      const matchesMaxPrice = nextMaxPrice === undefined || priceValue <= nextMaxPrice;
                      const matchesDistance = nextMaxDistanceKm === undefined || item.distanceKm <= nextMaxDistanceKm;

                      return matchesCategory && matchesMinPrice && matchesMaxPrice && matchesDistance;
                    });

                    const sortedProducts = [...filteredProducts].sort((left, right) => {
                      if (sortBy === "priceLowToHigh") {
                        return getPriceValue(left.price) - getPriceValue(right.price);
                      }

                      if (sortBy === "priceHighToLow") {
                        return getPriceValue(right.price) - getPriceValue(left.price);
                      }

                      return left.distanceKm - right.distanceKm;
                    });

                    setProduct(sortedProducts);
                }
                else {
                    console.log("Get products failed:", response.status);
                }
            }
            catch(error){console.error('Error posting data:',error);}
      }

            const timer = setTimeout(() => {
              fetchAllProduct(searchKeyword);
            }, 300);

            return () => clearTimeout(timer);
          },[activeLocation, maxDistanceKm, maxPrice, minPrice, searchKeyword, selectedCategories, sortBy]);

    const toggleCategory = (category: string) => {
      setSelectedCategories((current) => (
        current.includes(category)
          ? current.filter((item) => item !== category)
          : [...current, category]
      ));
    };

    const clearFilters = () => {
      setSelectedCategories([]);
      setMinPrice("");
      setMaxPrice("");
      setMaxDistanceKm("");
    };

    const sortLabel = (
      sortBy === "distance"
        ? "Distance"
        : sortBy === "priceLowToHigh"
          ? "Price: Low to High"
          : "Price: High to Low"
    );
    

  return (
    <View style={styles.container}>
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheetBox}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            {[
              { label: "Distance", value: "distance" as const },
              { label: "Price: Low to High", value: "priceLowToHigh" as const },
              { label: "Price: High to Low", value: "priceHighToLow" as const },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sheetOption}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.sheetOptionText}>
                  {option.label}{sortBy === option.value ? " (Selected)" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterBox}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Price range</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={[styles.filterInput, styles.rangeInput]}
                  placeholder="Min price"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <TextInput
                  style={[styles.filterInput, styles.rangeInput]}
                  placeholder="Max price"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>

              <Text style={styles.filterLabel}>Distance within (km)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Any distance"
                keyboardType="numeric"
                value={maxDistanceKm}
                onChangeText={setMaxDistanceKm}
              />

              <Text style={styles.filterLabel}>Categories</Text>
              <View style={styles.categoryWrap}>
                {PRODUCT_CATEGORIES.map((category) => {
                  const selected = selectedCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={clearFilters}>
                <Text style={styles.secondaryButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.primaryButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLocationPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.promptBox}>
            <Text style={styles.promptTitle}>Choose your default location</Text>
            <Text style={styles.promptText}>
              We could not use your current location automatically. Select a location on the map and it will be saved as the default for browsing and posting until you change it.
            </Text>
            <TouchableOpacity
              style={styles.promptButton}
              onPress={() => {
                setShowLocationPrompt(false);
                router.push("/mapScreen?source=home");
              }}
            >
              <Text style={styles.promptButtonText}>Open Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>TradeHub</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/userInfo")}
        >
          <User size={26} color={AppPalette.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Search size={20} color={AppPalette.textBody} />
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
        onPress={() => router.push("/mapScreen?source=home")}
      >
        <MapPin size={20} color={AppPalette.primary} />
        <Text style={styles.locationButtonText}>
          {activeLocation
            ? `Location: ${activeLocation.locationName}`
            : "Select location"}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowSortModal(true)}>
          <ArrowUpDown size={18} color={AppPalette.primary} />
          <Text style={styles.actionButtonText}>Sort: {sortLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowFilterModal(true)}>
          <SlidersHorizontal size={18} color={AppPalette.primary} />
          <Text style={styles.actionButtonText}>
            Filter{selectedCategories.length || minPrice || maxPrice || maxDistanceKm ? " On" : ""}
          </Text>
        </TouchableOpacity>
      </View>

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
                    category: item.category,
                    contactDetails: item.contactDetails,
                    imageUri: item.imageUri,
                    locationName: item.locationName,
                    latitude: item.latitude,
                    longitude: item.longitude,
                },
                })
            }
          >
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
              <Text style={styles.productMeta}>{item.category || "Uncategorized"}</Text>
              <Text style={styles.productPrice}>{item.price} baht</Text>
              <Text style={styles.productMeta}>{item.locationName || "No location set"}</Text>
              <Text style={styles.productMeta}>
                {Number.isFinite(item.distanceKm) ? `${item.distanceKm.toFixed(1)} km away` : "Distance unavailable"}
              </Text>
              <Text style={styles.productMeta}>{item.contactDetails || "No contact details"}</Text>
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
    backgroundColor: AppPalette.background,
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
    color: AppPalette.primary,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppPalette.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppPalette.card,
  },
  searchBox: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppPalette.border,
    backgroundColor: AppPalette.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: AppPalette.textDark,
  },
  locationButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppPalette.border,
    backgroundColor: AppPalette.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  locationButtonText: {
    flex: 1,
    color: AppPalette.textBody,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppPalette.border,
    backgroundColor: AppPalette.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: AppPalette.primary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
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
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: AppPalette.placeholder,
    marginRight: 14,
  },
  productImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: AppPalette.placeholder,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: AppPalette.muted,
    marginBottom: 8,
  },
  productMeta: {
    fontSize: 13,
    color: AppPalette.textBody,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: AppPalette.primary,
    marginBottom: 4,
  },
  productUser: {
    fontSize: 13,
    color: AppPalette.textBody,
  },
  emptyText: {
    color: AppPalette.textBody,
    textAlign: "center",
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: AppPalette.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  promptBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 15,
    color: AppPalette.textBody,
    lineHeight: 22,
    marginBottom: 18,
  },
  promptButton: {
    backgroundColor: AppPalette.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  promptButtonText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
  },
  sheetBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  filterBox: {
    width: "100%",
    maxWidth: 380,
    maxHeight: 620,
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 14,
  },
  sheetOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: AppPalette.border,
  },
  sheetOptionText: {
    fontSize: 16,
    color: AppPalette.textDark,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: AppPalette.primary,
    marginBottom: 8,
    marginTop: 10,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterInput: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppPalette.border,
    backgroundColor: AppPalette.background,
    color: AppPalette.textDark,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  rangeInput: {
    flex: 1,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AppPalette.border,
    backgroundColor: AppPalette.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipSelected: {
    backgroundColor: AppPalette.primary,
    borderColor: AppPalette.primary,
  },
  categoryChipText: {
    color: AppPalette.textBody,
    fontSize: 13,
    fontWeight: "700",
  },
  categoryChipTextSelected: {
    color: AppPalette.card,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppPalette.background,
  },
  secondaryButtonText: {
    color: AppPalette.textBody,
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppPalette.primary,
  },
  primaryButtonText: {
    color: AppPalette.card,
    fontSize: 15,
    fontWeight: "700",
  },
});
