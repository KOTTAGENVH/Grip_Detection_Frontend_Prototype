import { apiClient } from "../axios/api";

//Grip model api
export const gripModel = async (image_url: string, type: string) => {
  try {
    const response = await apiClient.post("/classify_image", {
      image_url: image_url,
      type: type,
    });
    if (response.status !== 200) {
      alert("Error: " + response?.data?.error);
      return response;
    } else {
      alert(response?.data?.data?.message);
      return response;
    }
    return response;
  } catch (error) {
    console.error(error);
  }
};
