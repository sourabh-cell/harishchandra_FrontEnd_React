// Save JWT token
export const setToken = (token) => {
  localStorage.setItem("jwtToken", token);
};

// Get JWT token
export const getToken = () => {
  return localStorage.getItem("jwtToken");
};

// Remove JWT token
export const removeToken = () => {
  localStorage.removeItem("jwtToken");
};
