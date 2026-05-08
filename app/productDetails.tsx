//link from home page when clicked at specific product
import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function ProductDetailsScreen() {
  const { name, price, detail, user, date } = useLocalSearchParams<{
    name?: string;
    price?: string;
    detail?: string;
    user?: string;
    date?: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder} />

      <View style={styles.detailsBox}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>{price} baht</Text>

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
    backgroundColor: "#f2f2f2",
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#e6e6e6",
    marginBottom: 18,
  },
  detailsBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#123f3b",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
  },
  meta: {
    fontSize: 14,
    color: "#777",
  },
});
