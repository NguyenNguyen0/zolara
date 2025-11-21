import { Redirect } from "expo-router";

export default function GroupIndex() {
  // Redirect to the create group screen by default
  return <Redirect href="./create" />;
}
