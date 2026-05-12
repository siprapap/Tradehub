//link from home page when clicked at specific product
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { AppPalette } from "@/constants/theme";
import { Image } from "expo-image";

export default function ProductDetailsScreen() {
  const { name, price, detail, user, date, category, contactDetails, imageUri, locationName } = useLocalSearchParams<{
    name?: string;
    price?: string;
    detail?: string;
    user?: string;
    date?: string;
    category?: string;
    contactDetails?: string;
    imageUri?: string;
    locationName?: string;
  }>();

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.productImage} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <View style={styles.detailsBox}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price} baht</Text>

        <Text style={styles.label}>Category</Text>
        <Text style={styles.detail}>{category || "-"}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.detail}>{locationName || "-"}</Text>

        <Text style={styles.label}>Contact details</Text>
        <Text style={styles.detail}>{contactDetails || "-"}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.detail}>{detail}</Text>

        <Text style={styles.meta}>
          Posted by {user} on {date}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: AppPalette.background,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: AppPalette.placeholder,
    marginBottom: 18,
  },
  productImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: AppPalette.placeholder,
    marginBottom: 18,
  },
  detailsBox: {
    backgroundColor: AppPalette.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: AppPalette.border,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: AppPalette.primary,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: AppPalette.textDark,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: AppPalette.primary,
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    color: AppPalette.textBody,
    lineHeight: 22,
    marginBottom: 20,
  },
  meta: {
    fontSize: 14,
    color: AppPalette.textBody,
  },
});
