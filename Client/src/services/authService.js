import API from "./api";


export const authService = {
  async loginUser(emailOrUsername, password) {
    const response = await API.post("/login", {
      emailOrUsername,
      password,
    });

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    // localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

  async registerUser(userData) {
    const response = await API.post(
      "/register",
      userData,
    );

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    // sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  },

};
