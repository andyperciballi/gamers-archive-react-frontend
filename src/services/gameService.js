const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URL}/games`;

const getAuthHeaders = (isJson = false) => {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Authorization': `Bearer ${token}`,
    };

    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

export const searchGames = async (query) => {
    try {
        const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders(),
        });
        return await res.json();
    } catch (error) {
        console.log(error);
        throw new Error(error.message); 
    }
}

export const index = async () => {
    try {
        const res = await fetch(BASE_URL, {
            headers: getAuthHeaders(),
        });
        return await res.json();
    } catch (error) {
        console.log(error);
        throw new Error(error.message); 
    }
};

export const create = async (formData) => {
    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(formData),
        });
        return await res.json();
    } catch (error) {
        console.log(error);
        throw new Error(error.message); 
    }
};

export const update = async (id, formData) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(true),
            body: JSON.stringify(formData),
        });
        return await res.json();
    }   catch (error) {
        console.log(error);
        throw new Error(error.message); 
    }
};

export const show = async (gameid) => {
    try {
        const res = await fetch(`${BASE_URL}/${gameid}`, {
            headers: getAuthHeaders(),
        });
        return await res.json();
    } catch (error) {
        console.log(error);
        throw new Error(error.message); 
    }
};

export const getGameDetails = async (igdbId) => {
  try {
    const res = await fetch(`${BASE_URL}/details/${igdbId}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};