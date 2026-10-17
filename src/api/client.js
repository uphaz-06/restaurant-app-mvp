import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// One place to change the server address.
// Physical phone: use your laptop LAN IP and keep both devices on the same Wi-Fi.
// Android emulator: use http://10.0.2.2:5000/api
// Web / iOS simulator: http://localhost:5000/api
const LAN_IP = "192.168.1.9";

export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : `http://${LAN_IP}:5000/api`;

export async function apiClient(endpoint, method = "GET", body) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(
      "Network request failed. Check BASE_URL, Wi-Fi, and that the server is running.",
    );
  }

  const responseText = await response.text();
  let data = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`Server returned an invalid response (${response.status})`);
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}
