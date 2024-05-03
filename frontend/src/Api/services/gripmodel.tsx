import { apiClient } from "../axios/api";

//Grip model api
export const gripModel =  async (image_url: any, type: any) => {
    try {
    const response = await apiClient.post("classify_image", {
        image_url: image_url,
        type: type,
    });

    return response.data;
    } catch (error) {
    console.error(error);
    }
}
