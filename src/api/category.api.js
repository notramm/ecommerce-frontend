import api from "./axios";

// Raw API call
export const getCategoryTree = () => api.get("/categories");

// Normalized helper — returns array directly
export const getCategories = async () => {
  const { data } = await api.get("/categories");
  // Backend ApiResponse wrapper: { success, data: [...tree...] }
  const arr = data?.data || [];
  return Array.isArray(arr) ? arr : [];
};

export const getCategoriesFlat = async () => {
  const { data } = await api.get("/categories/all"); // need backend
  const arr = data?.data || [];
  return Array.isArray(arr) ? arr : [];
};