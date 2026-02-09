const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URL}/auth`;

const signUp = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": Bearer <Token>
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    // check if we got an error
    if (data.err) {
      throw new Error(data.err);
    }

    const { token } = data;

    if (token) {
      localStorage.setItem("token", token);
      return JSON.parse(atob(token.split(".")[1])).payload;
    }

    throw new Error("Invalid response from the server");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const signIn = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    // This data will have the response from out back end
    const data = await res.json();
    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      return JSON.parse(atob(data.token.split(".")[1])).payload;
    }

    throw new Error("Invalid Response from server");
  } catch (error) {
    console.log(error);
  }
};
export { signUp, signIn };
